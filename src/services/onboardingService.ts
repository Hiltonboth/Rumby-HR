import { supabase } from '../lib/supabase';

export const onboardingService = {
  async getChecklist(employeeIdOrUserId: string) {
    // Try by employee_id first, then fallback to finding employee by user_id
    const { data: byEmp, error: err1 } = await supabase
      .from('onboarding_checklists')
      .select('*, onboarding_tasks(*)')
      .eq('employee_id', employeeIdOrUserId)
      .maybeSingle();
    
    if (byEmp) return byEmp;

    // Fallback search by user_id link in employees table
    const { data: emp } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', employeeIdOrUserId)
      .maybeSingle();

    if (emp) {
      const { data, error } = await supabase
        .from('onboarding_checklists')
        .select('*, onboarding_tasks(*)')
        .eq('employee_id', emp.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
    
    return null;
  },

  async getAllChecklists(companyId: string) {
    const { data, error } = await supabase
      .from('onboarding_checklists')
      .select('*, employees(first_name, last_name, avatar_url, job_title)')
      .eq('company_id', companyId);
    
    if (error) throw error;
    return data;
  },

  async toggleTask(taskId: string, isCompleted: boolean) {
    const { data, error } = await supabase
      .from('onboarding_tasks')
      .update({ 
        is_completed: isCompleted, 
        completed_at: isCompleted ? new Date().toISOString() : null 
      })
      .eq('id', taskId)
      .select('checklist_id')
      .single();
    
    if (error) throw error;

    // Recalculate progress for the checklist
    await this.updateProgress(data.checklist_id);
    return true;
  },

  async updateProgress(checklistId: string) {
    const { data: tasks } = await supabase
      .from('onboarding_tasks')
      .select('is_completed')
      .eq('checklist_id', checklistId);
    
    if (!tasks) return;

    const completed = tasks.filter(t => t.is_completed).length;
    const progress = Math.round((completed / tasks.length) * 100);

    const { error } = await supabase
      .from('onboarding_checklists')
      .update({ 
        progress, 
        status: progress === 100 ? 'completed' : 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', checklistId);
    
    if (error) throw error;
  },

  async initializeOnboarding(employeeId: string, companyId: string) {
    try {
      // 1. Create the checklist
      const { data: checklist, error: chkErr } = await supabase
        .from('onboarding_checklists')
        .insert({
          company_id: companyId,
          employee_id: employeeId,
          status: 'in_progress',
          progress: 0
        })
        .select()
        .single();
      
      if (chkErr) throw chkErr;

      // 2. Define standard tasks
      const standardTasks = [
        { 
          checklist_id: checklist.id, 
          title: 'Sign Non-Disclosure Agreement (NDA)', 
          description: 'Legal requirement for all new hires.', 
          category: 'legal',
          is_completed: false 
        },
        { 
          checklist_id: checklist.id, 
          title: 'Receive Laptop & Terms Sheet', 
          description: 'Equipment handover and acceptance.', 
          category: 'equipment',
          is_completed: false 
        },
        { 
          checklist_id: checklist.id, 
          title: 'Submit Banking Details', 
          description: 'Needed for payroll processing.', 
          category: 'finance',
          is_completed: false 
        }
      ];

      const { error: taskErr } = await supabase
        .from('onboarding_tasks')
        .insert(standardTasks);

      if (taskErr) throw taskErr;
      return true;
    } catch (err) {
      console.error("Manual onboarding init failed:", err);
      // Fallback to RPC if client-side fails or fails policies
      const { error } = await supabase.rpc('initialize_employee_onboarding', {
        target_employee_id: employeeId,
        target_company_id: companyId
      });
      if (error) throw error;
      return true;
    }
  }
};
