import { supabase } from '../lib/supabase';

export const selfService = {
  async getChangeRequests(companyId: string) {
    const { data, error } = await supabase
      .from('change_requests')
      .select('*, employees(first_name, last_name, avatar_url)')
      .eq('company_id', companyId)
      .eq('status', 'pending');
    if (error) throw error;
    return data;
  },

  async requestChange(request: {
    companyId: string;
    employeeId: string;
    fieldName: string;
    oldValue: any;
    newValue: any;
  }) {
    const { data, error } = await supabase
      .from('change_requests')
      .insert({
        company_id: request.companyId,
        employee_id: request.employeeId,
        field_name: request.fieldName,
        old_value: String(request.oldValue),
        new_value: String(request.newValue),
        status: 'pending'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async approveChange(requestId: string, hrId: string) {
    // 1. Get the request details
    const { data: request, error: fetchError } = await supabase
      .from('change_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    
    if (fetchError || !request) throw fetchError;

    // 2. Update the employee record
    const { error: updateEmpError } = await supabase
      .from('employees')
      .update({ [request.field_name]: request.new_value })
      .eq('id', request.employee_id);
    
    if (updateEmpError) throw updateEmpError;

    // 3. Mark request as approved
    const { error: updateReqError } = await supabase
      .from('change_requests')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', requestId);
    
    if (updateReqError) throw updateReqError;

    return true;
  },

  async rejectChange(requestId: string, notes: string) {
     const { error } = await supabase
      .from('change_requests')
      .update({ status: 'rejected', hr_notes: notes, updated_at: new Date().toISOString() })
      .eq('id', requestId);
    if (error) throw error;
    return true;
  },

  async instantUpdate(employeeId: string, fields: Record<string, any>) {
    const { error } = await supabase
      .from('employees')
      .update(fields)
      .eq('id', employeeId);
    if (error) throw error;
    return true;
  }
};
