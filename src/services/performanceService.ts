import { supabase } from '../lib/supabase';

export interface PerformanceReviewCycle {
  id: string;
  company_id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'closed';
}

export interface PerformanceReview {
  id: string;
  company_id: string;
  cycle_id: string;
  employee_id: string;
  manager_id?: string;
  status: 'self_appraisal' | 'manager_review' | 'completed';
  overall_rating?: number;
  self_rating?: number;
  manager_rating?: number;
  summary?: string;
  strengths?: string;
  areas_for_growth?: string;
  development_plan?: { item: string, deadline: string, status: 'pending' | 'completed' }[];
  feedback?: PerformanceFeedback[];
}

export interface PerformanceGoal {
  id: string;
  employee_id: string;
  title: string;
  description?: string;
  kpi_target?: string;
  progress: number;
  status: 'in_progress' | 'achieved' | 'overdue' | 'cancelled';
  due_date?: string;
}

export interface PerformanceFeedback {
  id: string;
  review_id: string;
  provider_id: string;
  is_anonymous: boolean;
  content: string;
  rating?: number;
}

export const performanceService = {
  // Review Cycles
  async getReviewCycles(companyId: string) {
    const { data, error } = await supabase
      .from('performance_review_cycles')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createReviewCycle(cycle: Partial<PerformanceReviewCycle>) {
    const { data, error } = await supabase
      .from('performance_review_cycles')
      .insert(cycle)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Performance Reviews
  async getEmployeeReviews(employeeId: string) {
    const { data, error } = await supabase
      .from('performance_reviews')
      .select(`
        *,
        cycle:performance_review_cycles(*),
        manager:employees!performance_reviews_manager_id_fkey(*)
      `)
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getReviewById(reviewId: string) {
    const { data, error } = await supabase
      .from('performance_reviews')
      .select(`
        *,
        cycle:performance_review_cycles(*),
        employee:employees(*),
        manager:employees!performance_reviews_manager_id_fkey(*),
        feedback:performance_feedback(
          *,
          provider:employees(*)
        )
      `)
      .eq('id', reviewId)
      .single();
    if (error) throw error;
    return data;
  },

  async updateReview(reviewId: string, updates: Partial<PerformanceReview>) {
    const { data, error } = await supabase
      .from('performance_reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createReview(review: Partial<PerformanceReview>) {
    const { data, error } = await supabase
      .from('performance_reviews')
      .insert(review)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Goals
  async getEmployeeGoals(employeeId: string) {
    const { data, error } = await supabase
      .from('performance_goals')
      .select('*')
      .eq('employee_id', employeeId)
      .order('due_date', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createGoal(goal: Partial<PerformanceGoal>) {
    const { data, error } = await supabase
      .from('performance_goals')
      .insert(goal)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateGoalProgress(goalId: string, progress: number, status?: string) {
    const updates: any = { progress, updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    
    const { data, error } = await supabase
      .from('performance_goals')
      .update(updates)
      .eq('id', goalId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 360 Feedback
  async submitFeedback(feedback: Partial<PerformanceFeedback>) {
    const { data, error } = await supabase
      .from('performance_feedback')
      .insert(feedback)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
