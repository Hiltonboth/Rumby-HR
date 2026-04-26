import { supabase } from '../lib/supabase';

export const analyticsService = {
  async getDashboardStats(companyId: string) {
    // 1. Monies (Total Payroll of last month)
    const { data: payrollData } = await supabase
      .from('payroll_runs')
      .select('total_gross')
      .eq('company_id', companyId)
      .eq('status', 'paid')
      .order('period_year', { ascending: false })
      .order('period_month', { ascending: false })
      .limit(1);
    
    // 2. Headcount
    const { count: headcount } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'active');

    // 3. Applicants
    const { count: applicants } = await supabase
      .from('applicants')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);

    // 4. Hires (Employees with status 'active' or 'onboarding' created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { count: hires } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    // 5. Documents
    const { data: envData } = await supabase
      .from('document_envelopes')
      .select('status')
      .eq('company_id', companyId);
    
    const signedDocs = envData?.filter(d => d.status === 'completed').length || 0;
    const pendingDocs = envData?.filter(d => d.status === 'sent' || d.status === 'draft').length || 0;

    // 6. Pending Change Requests
    const { count: pendingChanges } = await supabase
      .from('change_requests')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'pending');

    // 7. Active Onboardings
    const { count: activeOnboardings } = await supabase
      .from('onboarding_checklists')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'in_progress');

    return {
      monies: payrollData?.[0]?.total_gross || 0,
      headcount: headcount || 0,
      applicants: applicants || 0,
      hires: hires || 0,
      signedDocs,
      pendingDocs,
      totalDocs: envData?.length || 0,
      pendingChanges: pendingChanges || 0,
      activeOnboardings: activeOnboardings || 0
    };
  },

  async getSalaryTrends(companyId: string, months: number = 6) {
    const { data } = await supabase
      .from('payroll_runs')
      .select('period_month, period_year, total_gross')
      .eq('company_id', companyId)
      .eq('status', 'paid')
      .order('period_year', { ascending: false })
      .order('period_month', { ascending: false })
      .limit(months);
    
    return data?.reverse().map(run => ({
      name: `${getMonthName(run.period_month)}`,
      value: run.total_gross
    })) || [];
  },

  async getHeadcountTrends(companyId: string, months: number = 6) {
    // Simple simulation for growth chart if no historical headcount table exists
    // In a real app, you'd have a snapshot table
    const labels = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(getMonthName(d.getMonth() + 1));
    }

    const { data: employees } = await supabase
      .from('employees')
      .select('created_at')
      .eq('company_id', companyId);

    const counts = labels.map((_, idx) => {
        const threshold = new Date(now.getFullYear(), now.getMonth() - (months - 1 - idx) + 1, 0);
        return employees?.filter(e => new Date(e.created_at) <= threshold).length || 0;
    });

    return labels.map((name, i) => ({
      name,
      value: counts[i]
    }));
  },

  async getExpiringContracts(companyId: string) {
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

    const { data, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name, job_title, contract_end_date, avatar_url')
      .eq('company_id', companyId)
      .not('contract_end_date', 'is', null)
      .lte('contract_end_date', sixtyDaysFromNow.toISOString())
      .order('contract_end_date', { ascending: true });

    if (error) throw error;
    return data.map(emp => ({
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      role: emp.job_title,
      expiryDate: emp.contract_end_date,
      avatar: emp.avatar_url
    }));
  }
};

function getMonthName(monthIndex: number) {
  const date = new Date();
  date.setMonth(monthIndex - 1);
  return date.toLocaleString('default', { month: 'short' });
}
