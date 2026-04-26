import { supabase } from '../lib/supabase';

export const leaveService = {
  async getLeaveTypes(companyId: string) {
    const { data, error } = await supabase
      .from('leave_types')
      .select('*')
      .eq('company_id', companyId);
    if (error) throw error;
    return data;
  },

  async getLeaveBalances(employeeId: string) {
    const { data, error } = await supabase
      .from('leave_balances')
      .select('*, leave_types(name, accrual_rate)')
      .eq('employee_id', employeeId);
    if (error) throw error;
    return data;
  },

  async createLeaveRequest(request: {
    companyId: string;
    employeeId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    managerId?: string;
  }) {
    // Determine initial status based on manager presence
    const status = request.managerId ? 'pending_manager' : 'pending_hr';

    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        company_id: request.companyId,
        employee_id: request.employeeId,
        leave_type_id: request.leaveTypeId,
        start_date: request.startDate,
        end_date: request.endDate,
        total_days: request.totalDays,
        reason: request.reason,
        status,
        manager_id: request.managerId
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getPendingRequests(companyId: string, managerId?: string) {
    let query = supabase
      .from('leave_requests')
      .select('*, employees!employee_id(first_name, last_name, avatar_url), leave_types(name)')
      .eq('company_id', companyId);

    if (managerId) {
      query = query.eq('manager_id', managerId).eq('status', 'pending_manager');
    } else {
      query = query.eq('status', 'pending_hr');
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateRequestStatus(requestId: string, status: 'approved' | 'rejected' | 'pending_hr', notes: string, isHr: boolean) {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (isHr) {
      updateData.hr_notes = notes;
    } else {
      updateData.manager_notes = notes;
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();
    
    if (error) throw error;

    // If fully approved, deduct from balance
    if (status === 'approved') {
       const { data: request } = await supabase
         .from('leave_requests')
         .select('employee_id, leave_type_id, total_days')
         .eq('id', requestId)
         .single();
       
       if (request) {
          const { data: balance } = await supabase
            .from('leave_balances')
            .select('balance')
            .eq('employee_id', request.employee_id)
            .eq('leave_type_id', request.leave_type_id)
            .single();
          
          if (balance) {
            await supabase
              .from('leave_balances')
              .update({ balance: balance.balance - request.total_days })
              .eq('employee_id', request.employee_id)
              .eq('leave_type_id', request.leave_type_id);
          }
       }
    }

    return data;
  },

  async seedLeaveBalances(employeeId: string, companyId: string) {
    const types = await this.getLeaveTypes(companyId);
    if (!types || types.length === 0) return;

    const balances = types.map(t => ({
      employee_id: employeeId,
      leave_type_id: t.id,
      balance: t.annual_allowance / 12, // Initial month accrual
      last_accrued_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('leave_balances')
      .upsert(balances, { onConflict: 'employee_id, leave_type_id' });
    
    if (error) console.error("Error seeding balances:", error);
  }
};
