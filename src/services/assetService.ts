import { supabase } from '../lib/supabase';
import { documentService } from './documentService';

export const assetService = {
  async getAssets(companyId: string) {
    const { data, error } = await supabase
      .from('assets')
      .select('*, asset_assignments(employee_id, status, employees(first_name, last_name))')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createAsset(asset: any) {
    const { data, error } = await supabase
      .from('assets')
      .insert(asset)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateAsset(assetId: string, updates: any) {
    const { error } = await supabase
      .from('assets')
      .update(updates)
      .eq('id', assetId);
    
    if (error) throw error;
    return true;
  },

  async assignAsset(assetId: string, employeeId: string, companyId: string, triggerEsign: boolean = false) {
    // 1. Create the assignment record
    const { data: assignment, error: assignError } = await supabase
      .from('asset_assignments')
      .insert({
        asset_id: assetId,
        employee_id: employeeId,
        status: 'active'
      })
      .select()
      .single();
    
    if (assignError) throw assignError;

    // 2. Update asset status
    await this.updateAsset(assetId, { status: 'assigned' });

    // 3. Trigger E-signature if requested
    if (triggerEsign) {
      try {
        const { data: asset } = await supabase.from('assets').select('name, asset_tag').eq('id', assetId).single();
        const { data: emp } = await supabase.from('employees').select('first_name, last_name, email').eq('id', employeeId).single();
        
        if (asset && emp) {
            // In a real app, you'd generate a PDF first. For now, we use a placeholder URL.
            await documentService.createEnvelope({
                companyId: companyId,
                title: `Asset Acceptance: ${asset.name} (${asset.asset_tag})`,
                fileUrl: 'https://example.com/templates/asset_acceptance_form.pdf', // Placeholder
            }, [{
                email: emp.email,
                fullName: `${emp.first_name} ${emp.last_name}`,
                signingOrder: 1
            }]);
        }
      } catch (esignError) {
        console.error("Failed to trigger asset e-signature:", esignError);
      }
    }

    return assignment;
  },

  async returnAsset(assignmentId: string, assetId: string, condition: string) {
    // 1. Update assignment
    const { error: assignError } = await supabase
      .from('asset_assignments')
      .update({
        status: 'returned',
        returned_at: new Date().toISOString(),
        condition_at_return: condition
      })
      .eq('id', assignmentId);
    
    if (assignError) throw assignError;

    // 2. Update asset status
    await this.updateAsset(assetId, { status: 'available' });

    return true;
  },

  async reportIssue(issue: { assetId: string, employeeId: string, description: string }) {
    const { error } = await supabase
      .from('asset_issues')
      .insert({
        asset_id: issue.assetId,
        employee_id: issue.employeeId,
        issue_description: issue.description
      });
    
    if (error) throw error;
    return true;
  },

  async getEmployeeAssets(employeeId: string) {
    const { data, error } = await supabase
      .from('asset_assignments')
      .select('*, assets(*)')
      .eq('employee_id', employeeId)
      .eq('status', 'active');
    
    if (error) throw error;
    return data;
  },

  async addMaintenanceRecord(record: { assetId: string, companyId: string, description: string, cost?: number, invoiceUrl?: string, performedBy?: string, maintenanceDate: string }) {
    const { data, error } = await supabase
      .from('asset_maintenance')
      .insert({
        asset_id: record.assetId,
        company_id: record.companyId,
        description: record.description,
        cost: record.cost,
        invoice_url: record.invoiceUrl,
        performed_by: record.performedBy,
        maintenance_date: record.maintenanceDate
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMaintenanceHistory(assetId: string) {
    const { data, error } = await supabase
      .from('asset_maintenance')
      .select('*')
      .eq('asset_id', assetId)
      .order('maintenance_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async bulkImport(companyId: string, assets: any[]) {
      const formatted = assets.map(a => ({ ...a, company_id: companyId }));
      const { error } = await supabase.from('assets').insert(formatted);
      if (error) throw error;
      return true;
  },

  async triggerAnnualVerification(companyId: string) {
      // In a real app, this would send emails via a background task. 
      // For now we simulate by creating "Verification Pending" issues or notifications.
      console.log(`Triggering annual asset verification for company: ${companyId}`);
      return true;
  },

  async flagAssetsForRecovery(employeeId: string) {
    const { error: assignmentError } = await supabase
      .from('asset_assignments')
      .update({ status: 'pending_retrieval', updated_at: new Date().toISOString() })
      .eq('employee_id', employeeId)
      .eq('status', 'active');

    if (assignmentError) throw assignmentError;

    // Also update the status of the assets themselves in the main table
    const { data: assignments } = await supabase
      .from('asset_assignments')
      .select('asset_id')
      .eq('employee_id', employeeId);

    if (assignments && assignments.length > 0) {
      const assetIds = assignments.map(a => a.asset_id);
      const { error: assetError } = await supabase
        .from('assets')
        .update({ status: 'pending_retrieval' })
        .in('id', assetIds);
      if (assetError) throw assetError;
    }

    return true;
  }
};
