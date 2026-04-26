import { supabase } from '../lib/supabase';
import { Candidate, JobPosting } from '../types';

export const recruitmentService = {
  // --- Job Postings ---
  async getJobPostings(companyId: string) {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*, applicants(count)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(job => ({
      id: job.id,
      companyId: job.company_id,
      title: job.title,
      department: job.department,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      jobType: job.job_type,
      status: job.status,
      isExternal: job.is_external ?? true,
      customFieldsConfig: job.custom_fields_config || [],
      deadline: job.deadline,
      createdAt: job.created_at,
      applicantsCount: job.applicants?.[0]?.count || 0
    })) as JobPosting[];
  },

  async createJobPosting(job: Partial<JobPosting>) {
    const { data, error } = await supabase
      .from('job_postings')
      .insert({
        company_id: job.companyId,
        title: job.title,
        department: job.department,
        description: job.description,
        requirements: job.requirements,
        location: job.location,
        job_type: job.jobType,
        status: job.status,
        deadline: job.deadline
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // --- Applicants ---
  async getApplicants(companyId: string, jobId?: string) {
    let query = supabase
      .from('applicants')
      .select('*, job_postings(title)')
      .eq('company_id', companyId);
    
    if (jobId) {
      query = query.eq('job_posting_id', jobId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(app => ({
      id: app.id,
      companyId: app.company_id,
      name: app.full_name,
      email: app.email,
      phone: app.phone,
      role: app.job_postings?.title || 'Unknown Role',
      jobId: app.job_posting_id,
      status: app.stage as any, // Should match 'Applied' | 'Shortlisted' | 'Initial Interview' | 'Reference Check' | 'Medical' | 'Final Offer' | 'Hired' | 'Rejected'
      score: app.rating || 0,
      resumeUrl: app.resume_url,
      aiScore: app.ai_score,
      notes: app.notes,
      customFields: app.custom_fields,
      appliedAt: app.created_at
    })) as Candidate[];
  },

  async submitApplication(companyId: string, jobId: string, data: { name: string, email: string, phone: string, resumeUrl: string, customFields?: any }) {
    const { data: app, error } = await supabase
      .from('applicants')
      .insert({
        company_id: companyId,
        job_posting_id: jobId,
        full_name: data.name,
        email: data.email,
        phone: data.phone,
        resume_url: data.resumeUrl,
        custom_fields: data.customFields,
        stage: 'Applied'
      })
      .select()
      .single();

    if (error) throw error;
    return app;
  },

  async updateApplicant(id: string, updates: Partial<any>) {
    const { data, error } = await supabase
      .from('applicants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteApplicant(id: string) {
    const { error } = await supabase
      .from('applicants')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --- Storage ---
  async uploadResume(companyId: string, applicantId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${applicantId}.${fileExt}`;
    const filePath = `${companyId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    return publicUrl;
  }
};
