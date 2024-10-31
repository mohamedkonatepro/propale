import { NextApiRequest, NextApiResponse } from 'next';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const { id } = req.query;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Recursive function to retrieve all child company IDs
    const getAllCompanyIds = async (companyId: string): Promise<string[]> => {
      const { data: childCompanies, error: childError } = await supabase
        .from('company')
        .select('id')
        .eq('company_id', companyId);

      if (childError) {
        throw new Error('Error fetching child companies');
      }

      let companyIds = childCompanies ? childCompanies.map(company => company.id) : [];
      
      // Recursively retrieve children for each child company
      for (const childId of companyIds) {
        const childCompanyIds = await getAllCompanyIds(childId);
        companyIds = companyIds.concat(childCompanyIds);
      }

      return companyIds;
    };

    // Retrieve all IDs for the main company and its children
    const allCompanyIds = await getAllCompanyIds(id as string);
    allCompanyIds.push(id as string); // Add the main company

    // For each company (including the main one), delete associated data
    for (const companyId of allCompanyIds) {
      // Retrieve workflows associated with the company
      const { data: workflows, error: workflowError } = await supabase
        .from('workflows')
        .select('id')
        .eq('company_id', companyId);

      if (workflowError) {
        throw new Error(`Error fetching workflows for company ID ${companyId}`);
      }

      // Delete associations for each workflow
      for (const workflow of workflows || []) {
        const { id: workflowId } = workflow;

        // Retrieve product and question IDs for this workflow
        const { data: products } = await supabase
          .from('products')
          .select('id')
          .eq('workflow_id', workflowId);

        const { data: questions } = await supabase
          .from('questions')
          .select('id')
          .eq('workflow_id', workflowId);

        const productIds = products?.map(p => p.id) || [];
        const questionIds = questions?.map(q => q.id) || [];

        // Delete entries in question_product_mapping related to these products and questions
        const { error: deleteMappingError } = await supabase
          .from('question_product_mapping')
          .delete()
          .or(`product_id.in.(${productIds.join(',')}),question_id.in.(${questionIds.join(',')})`);

        if (deleteMappingError) {
          throw new Error(`Error deleting question-product mappings for workflow ID ${workflowId}`);
        }

        // Delete associated products
        const { error: productError } = await supabase
          .from('products')
          .delete()
          .eq('workflow_id', workflowId);

        // Delete associated questions
        const { error: questionError } = await supabase
          .from('questions')
          .delete()
          .eq('workflow_id', workflowId);

        // Delete associated dropdown values
        const { error: dropdownError } = await supabase
          .from('dropdown_values')
          .delete()
          .in('question_id', questionIds);

        if (productError || questionError || dropdownError) {
          throw new Error(`Error deleting workflow associations for workflow ID ${workflowId}`);
        }
      }

      // Delete workflows
      const { error: deleteWorkflowError } = await supabase
        .from('workflows')
        .delete()
        .eq('company_id', companyId);

      if (deleteWorkflowError) {
        throw new Error(`Error deleting workflows for company ID ${companyId}`);
      }

      // Retrieve associated profiles
      const { data: profileData, error: profileError } = await supabase
        .from('companies_profiles')
        .select('profile_id')
        .eq('company_id', companyId);

      if (profileError || !profileData) {
        throw new Error('Error fetching profile data');
      }

      // Delete related data in tables without cascade
      const { error: stepperSessionError } = await supabase
        .from('stepper_sessions')
        .delete()
        .eq('prospect_id', companyId);

      const { error: proposalError } = await supabase
        .from('proposals')
        .delete()
        .eq('prospect_id', companyId);

      if (stepperSessionError || proposalError) {
        throw new Error('Error deleting related data');
      }

      // Delete each corresponding user via Supabase Admin
      for (const profile of profileData) {
        const result = await supabaseAdmin.auth.admin.deleteUser(profile.profile_id);
        if (result.error) {
          throw new Error(`Error deleting user with profile id ${profile.profile_id}`);
        }
      }

      // Delete the company from the 'company' table
      const { error: companyError } = await supabase
        .from('company')
        .delete()
        .eq('id', companyId);

      if (companyError) {
        throw new Error('Error deleting company');
      }
    }

    return res.status(200).json({ message: 'Company and related data deleted successfully' });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
}
