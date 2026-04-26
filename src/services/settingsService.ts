import { supabase } from '../lib/supabase';
import { CompanySettings, StatutoryRates } from '../types';

export const settingsService = {
  async getSettings(companyId: string): Promise<CompanySettings | null> {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('company_id', companyId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows returned
    
    if (!data) return null;

    return {
      id: data.id,
      companyId: data.company_id,
      statutoryRates: data.statutory_rates as StatutoryRates,
      payrollLockDay: data.payroll_lock_day,
      allowEmployeeUploads: data.allow_employee_uploads,
      updatedAt: data.updated_at
    };
  },

  async updateSettings(settings: Partial<CompanySettings>) {
    const { data: existing } = await supabase
      .from('company_settings')
      .select('id')
      .eq('company_id', settings.companyId)
      .single();

    const payload = {
      company_id: settings.companyId,
      statutory_rates: settings.statutoryRates,
      payroll_lock_day: settings.payrollLockDay,
      allow_employee_uploads: settings.allowEmployeeUploads,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      const { error } = await supabase
        .from('company_settings')
        .update(payload)
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('company_settings')
        .insert(payload);
      if (error) throw error;
    }
  }
};
