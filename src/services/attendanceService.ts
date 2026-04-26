import { supabase } from '../lib/supabase';

export const attendanceService = {
  async getTodayLog(employeeId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async clockIn(employeeId: string, companyId: string, method: 'button' | 'qr' = 'button') {
    const { data, error } = await supabase
      .from('attendance_logs')
      .insert({
        employee_id: employeeId,
        company_id: companyId,
        clock_in: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        method
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async clockOut(logId: string) {
    const { data, error } = await supabase
      .from('attendance_logs')
      .update({
        clock_out: new Date().toISOString()
      })
      .eq('id', logId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getCompanyLogs(companyId: string, date?: string) {
    let query = supabase
      .from('attendance_logs')
      .select('*, employees(first_name, last_name, avatar_url)')
      .eq('company_id', companyId);
    
    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query.order('clock_in', { ascending: false });
    if (error) throw error;
    return data;
  }
};
