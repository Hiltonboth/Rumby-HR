import { supabase } from '../lib/supabase';
import { PayrollRun, PayrollProfile, StatutoryRates } from '../types';

export const payrollService = {
  async getTaxBands() {
    const { data, error } = await supabase
      .from('zimra_tax_bands')
      .select('*')
      .order('lower_limit', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getPayrollRuns(companyId: string) {
    const { data, error } = await supabase
      .from('payroll_runs')
      .select('*')
      .eq('company_id', companyId)
      .order('period', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getPayrollProfiles(companyId: string) {
    // We'll need a way to link employees to payroll profiles.
    // For now, let's assume we have a table or we're fetching from a joined query.
    // In our schema, we have an 'employees' table which has base salary.
    // We might need a separate 'payroll_profiles' if we want detailed statutory info per employee.
    // The user's provided schema didn't have 'payroll_profiles', so I'll use 'employees' for base info
    // and maybe suggest adding it if we need complex NEC/NSSA per person.
    
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', companyId);
    
    if (error) throw error;
    return data;
  },

  async createPayrollRun(run: Partial<PayrollRun>) {
    const { data, error } = await supabase
      .from('payroll_runs')
      .insert({ ...run, status: 'Draft' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async submitForApproval(runId: string, requestedBy: { id: string; name: string }) {
    const { error } = await supabase
      .from('payroll_runs')
      .update({ 
        status: 'Submitted',
        requested_by_id: requestedBy.id,
        requested_by_name: requestedBy.name
      })
      .eq('id', runId);
    
    if (error) throw error;
  },

  async approvePayrollRun(runId: string, approvedBy: { id: string; name: string }) {
    const { error } = await supabase
      .from('payroll_runs')
      .update({ 
        status: 'Approved',
        approved_by_id: approvedBy.id,
        approved_by_name: approvedBy.name,
        processed_at: new Date().toISOString()
      })
      .eq('id', runId);
    
    if (error) throw error;
  },

  async rejectPayrollRun(runId: string, reason: string) {
    const { error } = await supabase
      .from('payroll_runs')
      .update({ 
        status: 'Rejected',
        rejection_reason: reason
      })
      .eq('id', runId);
    
    if (error) throw error;
  },

  async finalizePayrollRun(runId: string, payslips: any[]) {
    // 1. Insert all payslips
    const { error: payslipError } = await supabase
      .from('payslips')
      .insert(payslips.map(p => ({ 
        ...p, 
        payroll_run_id: runId,
        created_at: new Date().toISOString()
      })));
    
    if (payslipError) throw payslipError;

    // 2. Update run status
    const { error: runError } = await supabase
      .from('payroll_runs')
      .update({ status: 'Paid', processed_at: new Date().toISOString() })
      .eq('id', runId);
    
    if (runError) throw runError;
  },

  async updatePayrollRunStatus(runId: string, status: string, userId?: string, userName?: string, reason?: string) {
    const updateData: any = { status };
    
    if (status === 'paid' || status === 'Approved') {
      updateData.approved_by_id = userId;
      updateData.approved_by_name = userName;
      updateData.processed_at = new Date().toISOString();
    } else if (status === 'rejected') {
      updateData.rejection_reason = reason;
    }

    const { error } = await supabase
      .from('payroll_runs')
      .update(updateData)
      .eq('id', runId);
    
    if (error) throw error;
  }
};
