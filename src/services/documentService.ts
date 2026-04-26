import { supabase } from '../lib/supabase';
import { DocumentEnvelope, DocumentRecipient } from '../types';

export const documentService = {
  async createEnvelope(envelope: Partial<DocumentEnvelope>, recipients: Partial<DocumentRecipient>[]) {
    // 1. Create Envelope
    const { data: envData, error: envError } = await supabase
      .from('document_envelopes')
      .insert({
        company_id: envelope.companyId,
        applicant_id: envelope.applicantId,
        title: envelope.title,
        status: 'draft',
        file_url: envelope.fileUrl
      })
      .select()
      .single();

    if (envError) throw envError;

    // 2. Create Recipients
    const recipientRecords = recipients.map(r => ({
      envelope_id: envData.id,
      email: r.email,
      full_name: r.fullName,
      signing_order: r.signingOrder || 1,
      status: 'pending'
    }));

    const { data: recData, error: recError } = await supabase
      .from('document_recipients')
      .insert(recipientRecords)
      .select();

    if (recError) throw recError;

    return { ...envData, recipients: recData };
  },

  async getEnvelope(id: string) {
    const { data, error } = await supabase
      .from('document_envelopes')
      .select('*, document_recipients(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      companyId: data.company_id,
      applicantId: data.applicant_id,
      title: data.title,
      status: data.status,
      fileUrl: data.file_url,
      signedFileUrl: data.signed_file_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      recipients: data.document_recipients.map((r: any) => ({
        id: r.id,
        envelopeId: r.envelope_id,
        email: r.email,
        fullName: r.full_name,
        signingOrder: r.signing_order,
        status: r.status,
        signedAt: r.signed_at,
        signatureData: r.signature_data,
        ipAddress: r.ip_address
      }))
    } as DocumentEnvelope;
  },

  async signDocument(recipientId: string, signatureData: string, ipAddress: string) {
    const { data, error } = await supabase
      .from('document_recipients')
      .update({
        signature_data: signatureData,
        status: 'signed',
        signed_at: new Date().toISOString(),
        ip_address: ipAddress
      })
      .eq('id', recipientId)
      .select()
      .single();

    if (error) throw error;

    // Check if all signers are done
    const { data: recipients } = await supabase
      .from('document_recipients')
      .select('status')
      .eq('envelope_id', data.envelope_id);

    const allSigned = recipients?.every(r => r.status === 'signed');
    
    if (allSigned) {
      await supabase
        .from('document_envelopes')
        .update({ status: 'completed' })
        .eq('id', data.envelope_id);
      
      // Logic for "sealing" the PDF would go here (usually cloud function)
    }

    return data;
  },

  async uploadDocument(companyId: string, name: string, file: File | Blob) {
    const fileName = `${Date.now()}_${name}`;
    const filePath = `${companyId}/envelopes/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes') // Reuse same bucket or create new
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async getEnvelopes(companyId: string): Promise<DocumentEnvelope[]> {
    const { data, error } = await supabase
      .from('document_envelopes')
      .select('*, document_recipients(*)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map((item: any) => ({
      id: item.id,
      companyId: item.company_id,
      title: item.title,
      status: item.status,
      fileUrl: item.file_url,
      signedFileUrl: item.signed_file_url,
      createdAt: item.created_at,
      recipients: item.document_recipients.map((r: any) => ({
        id: r.id,
        fullName: r.full_name,
        status: r.status
      }))
    } as any));
  },

  async getTemplates(companyId: string) {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('company_id', companyId);
    if (error) throw error;
    return data;
  },

  async createTemplate(companyId: string, title: string, description: string, fileUrl: string) {
    const { data, error } = await supabase
      .from('document_templates')
      .insert({ company_id: companyId, title, description, file_url: fileUrl })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
