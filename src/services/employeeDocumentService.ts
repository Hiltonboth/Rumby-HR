import { supabase } from '../lib/supabase';

export const employeeDocumentService = {
  async getEmployeeDocuments(employeeId: string, isHr: boolean = false) {
    let query = supabase
      .from('employee_documents')
      .select('*')
      .eq('employee_id', employeeId);
    
    // If not HR, filter out private documents
    if (!isHr) {
      query = query.eq('is_private', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async uploadDocument(doc: {
    companyId: string;
    employeeId: string;
    uploadedById?: string;
    title: string;
    category: string;
    file: File;
    expiryDate?: string;
    isPrivate?: boolean;
  }) {
    const fileExt = doc.file.name.split('.').pop();
    const fileName = `${doc.companyId}/${doc.employeeId}/${Date.now()}.${fileExt}`;
    const filePath = `vault/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes') // Using same bucket for simplicity
      .upload(filePath, doc.file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('employee_documents')
      .insert({
        company_id: doc.companyId,
        employee_id: doc.employeeId,
        uploaded_by_id: doc.uploadedById,
        title: doc.title,
        category: doc.category,
        file_url: publicUrl,
        expiry_date: doc.expiryDate || null,
        is_private: doc.isPrivate || false
      });

    if (dbError) throw dbError;
    return true;
  },

  async toggleDocumentPrivacy(docId: string, isPrivate: boolean) {
    const { error } = await supabase
      .from('employee_documents')
      .update({ is_private: isPrivate, updated_at: new Date().toISOString() })
      .eq('id', docId);
    if (error) throw error;
    return true;
  },

  async deleteDocument(docId: string) {
    const { error } = await supabase
      .from('employee_documents')
      .delete()
      .eq('id', docId);
    if (error) throw error;
    return true;
  },

  async getDocumentRequests(employeeId: string) {
    const { data, error } = await supabase
      .from('document_requests')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createDocumentRequest(req: {
    companyId: string;
    employeeId: string;
    title: string;
    category: string;
    dueDate?: string;
    notes?: string;
  }) {
    const { error } = await supabase
      .from('document_requests')
      .insert({
        company_id: req.companyId,
        employee_id: req.employeeId,
        requested_title: req.title,
        category: req.category,
        due_date: req.dueDate,
        notes: req.notes
      });
    if (error) throw error;
    return true;
  },

  async updateRequestStatus(reqId: string, status: 'pending' | 'uploaded' | 'cancelled') {
    const { error } = await supabase
      .from('document_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', reqId);
    if (error) throw error;
    return true;
  },

  async getExpiringDocuments(companyId: string, days: number = 60) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + days);

    const { data, error } = await supabase
      .from('employee_documents')
      .select('*, employees(first_name, last_name)')
      .eq('company_id', companyId)
      .not('expiry_date', 'is', null)
      .lte('expiry_date', thresholdDate.toISOString().split('T')[0]);
    
    if (error) throw error;
    return data;
  }
};
