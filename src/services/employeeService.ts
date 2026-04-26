import { supabase } from '../lib/supabase';
import { Employee, Department, EmployeeDocument } from '../types';
import { assetService } from './assetService';
import { onboardingService } from './onboardingService';

export const employeeService = {
  async getEmployees(companyId: string): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        departments (name),
        manager:manager_id (first_name, last_name)
      `)
      .eq('company_id', companyId);

    if (error) throw error;
    return data.map(emp => ({
      ...emp,
      firstName: emp.first_name,
      lastName: emp.last_name,
      name: `${emp.first_name} ${emp.last_name}`,
      jobTitle: emp.job_title,
      department: emp.departments?.name || emp.department,
      managerName: emp.manager ? `${emp.manager.first_name} ${emp.manager.last_name}` : undefined,
      avatar: emp.avatar_url,
      startDate: emp.start_date,
      contractEndDate: emp.contract_end_date,
      leaveAccrualRate: emp.leave_accrual_rate,
      employeeNumber: emp.employee_number
    }));
  },

  async getEmployeeById(employeeId: string): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        departments (name),
        manager:manager_id (first_name, last_name)
      `)
      .eq('id', employeeId)
      .single();

    if (error) throw error;
    return {
      ...data,
      firstName: data.first_name,
      lastName: data.last_name,
      name: `${data.first_name} ${data.last_name}`,
      jobTitle: data.job_title,
      department: data.departments?.name || data.department,
      managerName: data.manager ? `${data.manager.first_name} ${data.manager.last_name}` : undefined,
      avatar: data.avatar_url,
      startDate: data.start_date,
      contractEndDate: data.contract_end_date,
      leaveAccrualRate: data.leave_accrual_rate,
      employeeNumber: data.employee_number
    };
  },

  async updateEmployee(employeeId: string, updates: Partial<Employee>) {
    const dbUpdates: any = { ...updates };
    if (updates.firstName) dbUpdates.first_name = updates.firstName;
    if (updates.lastName) dbUpdates.last_name = updates.lastName;
    if (updates.jobTitle) dbUpdates.job_title = updates.jobTitle;
    if (updates.startDate) dbUpdates.start_date = updates.startDate;
    if (updates.contractEndDate) dbUpdates.contract_end_date = updates.contractEndDate;
    if (updates.leaveAccrualRate) dbUpdates.leave_accrual_rate = updates.leaveAccrualRate;
    if (updates.avatar) dbUpdates.avatar_url = updates.avatar;

    // Remove UI-only fields
    delete dbUpdates.name;
    delete dbUpdates.managerName;
    delete dbUpdates.firstName;
    delete dbUpdates.lastName;
    delete dbUpdates.jobTitle;
    delete dbUpdates.startDate;
    delete dbUpdates.contractEndDate;
    delete dbUpdates.leaveAccrualRate;
    delete dbUpdates.avatar;

    const { error } = await supabase
      .from('employees')
      .update(dbUpdates)
      .eq('id', employeeId);

    if (error) throw error;
  },

  async getEmployeeByEmail(email: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      firstName: data.first_name,
      lastName: data.last_name,
      name: `${data.first_name} ${data.last_name}`,
      jobTitle: data.job_title,
      avatar: data.avatar_url,
      startDate: data.start_date,
      employeeNumber: data.employee_number
    };
  },

  async getDirectReports(managerId: string): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        departments (name)
      `)
      .eq('manager_id', managerId);

    if (error) throw error;
    return data.map(emp => ({
      ...emp,
      firstName: emp.first_name,
      lastName: emp.last_name,
      name: `${emp.first_name} ${emp.last_name}`,
      jobTitle: emp.job_title,
      department: emp.departments?.name || emp.department,
      avatar: emp.avatar_url,
      startDate: emp.start_date,
      employeeNumber: emp.employee_number
    }));
  },

  async getDepartments(companyId: string): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select(`
        *,
        head:head_id (first_name, last_name)
      `)
      .eq('company_id', companyId);

    if (error) throw error;
    return data.map(dept => ({
      ...dept,
      headName: dept.head ? `${dept.head.first_name} ${dept.head.last_name}` : undefined,
      createdAt: dept.created_at
    }));
  },

  async getEmployeeDocuments(employeeId: string): Promise<EmployeeDocument[]> {
    const { data, error } = await supabase
      .from('employee_documents')
      .select('*')
      .eq('employee_id', employeeId);

    if (error) throw error;
    return data.map(doc => ({
      ...doc,
      employeeId: doc.employee_id,
      fileUrl: doc.file_url,
      expiryDate: doc.expiry_date,
      createdAt: doc.created_at
    }));
  },

  async uploadEmployeeDocument(companyId: string, employeeId: string, file: File, title: string, category: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${companyId}/${employeeId}/${Date.now()}.${fileExt}`;
    const filePath = `vault/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes') // Reusing resumes bucket for now, or could be 'documents'
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('employee_documents')
      .insert({
        company_id: companyId,
        employee_id: employeeId,
        title,
        category,
        file_url: publicUrl
      });

    if (dbError) throw dbError;
  },

  async updateEmployeeStatus(employeeId: string, status: string) {
    const { error } = await supabase
      .from('employees')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', employeeId);

    if (error) throw error;

    // If terminated, flag all assets for recovery
    if (status === 'terminated') {
      try {
        await assetService.flagAssetsForRecovery(employeeId);
      } catch (err) {
        console.error("Failed to flag assets for recovery:", err);
      }
    }

    return true;
  },

  async createEmployeeFromApplicant(companyId: string, applicant: any) {
    const names = applicant.name.split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || 'Unknown';

    const { data, error } = await supabase
      .from('employees')
      .insert({
        company_id: companyId,
        first_name: firstName,
        last_name: lastName,
        email: applicant.email,
        job_title: applicant.role,
        status: 'onboarding',
        start_date: new Date().toISOString().split('T')[0], // Default to today
        employee_number: `EMP-${Math.floor(1000 + Math.random() * 9000)}`
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger Onboarding Initialization
    try {
      await onboardingService.initializeOnboarding(data.id, companyId);
    } catch (onboardingErr) {
      console.error("Failed to auto-init onboarding:", onboardingErr);
    }

    return data;
  }
};
