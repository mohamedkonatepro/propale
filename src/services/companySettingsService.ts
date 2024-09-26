import { supabase } from '@/lib/supabaseClient';
import { DbCompanySettings } from '@/types/dbTypes';
import { CompanySettings, Workflow, Question, Product } from '@/types/models';
import { v4 as uuidv4 } from 'uuid';

export const deleteCompanySettings = async (companyId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('company_settings')
    .delete()
    .eq('company_id', companyId);

  if (error) {
    console.error('Error deleting company settings:', error);
    return false;
  }

  return true;
};

export const fetchCompanySettings = async (companyId: string): Promise<DbCompanySettings | null> => {
  try {
    // Retrieve basic company settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('company_settings')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();

    if (settingsError) throw settingsError;

    // If no settings exist, create default settings
    const settings = settingsData || {
      company_id: companyId,
      workflows_allowed: 0,
      users_allowed: 0,
      contacts_per_prospect: 0,
      folders_allowed: 0,
      vision_canevas: false,
      vision_audit: false,
      composition_workflow: false,
      license_type: 'individual',
      is_account_disabled: false
    };

    // Retrieve the associated workflow
    const { data: workflowData, error: workflowError } = await supabase
      .from('workflows')
      .select(`
        *,
        products:products(*),
        questions:questions(
          *,
          dropdownValues:dropdown_values(*)
        )
      `)
      .eq('company_id', companyId)
      .maybeSingle();

    if (workflowError) throw workflowError;

    let workflow = workflowData;

    // If a workflow exists, retrieve the mapping of questions and products
    if (workflow) {
      const { data: mappingData, error: mappingError } = await supabase
        .from('question_product_mapping')
        .select('*')
        .in('question_id', workflow.questions.map((q: any) => q.id));

      if (mappingError) throw mappingError;

      // Add mapping to each question
      workflow.questions = workflow.questions.map((question: any) => ({
        ...question,
        mapping: mappingData
          .filter((m: any) => m.question_id === question.id)
          .reduce((acc: any, m: any) => ({ ...acc, [m.response_key]: m.product_id }), {})
      }));
    } else {
      // If no workflow exists, create an empty workflow by default
      workflow = {
        company_id: companyId,
        name: 'Default Workflow',
        products: [],
        questions: []
      };
    }

    // Combine data
    const combinedSettings = {
      ...settings,
      workflow: workflow
    };

    return combinedSettings as DbCompanySettings;
  } catch (error) {
    console.error('Error fetching company settings:', error);
    return null;
  }
};

export const createOrUpdateCompanySettings = async (settings: CompanySettings): Promise<CompanySettings | null> => {
  try {
    // Update or create basic company settings
    const { data: updatedSettings, error: settingsError } = await supabase
      .from('company_settings')
      .upsert([{
        company_id: settings.company_id,
        workflows_allowed: settings.workflows_allowed,
        users_allowed: settings.users_allowed,
        contacts_per_prospect: settings.contacts_per_prospect,
        folders_allowed: settings.folders_allowed,
        vision_canevas: settings.vision_canevas,
        vision_audit: settings.vision_audit,
        composition_workflow: settings.composition_workflow,
        license_type: settings.license_type,
        is_account_disabled: settings.is_account_disabled
      }], { onConflict: 'company_id' })
      .select()
      .single();

    if (settingsError) throw settingsError;

    // Update or create the workflow
    if (settings.workflow) {
      const workflowId = settings.workflow.id ?? uuidv4();
      const { data: updatedWorkflow, error: workflowError } = await supabase
        .from('workflows')
        .upsert([{
          id: workflowId,
          company_id: settings.company_id,
          name: settings.workflow.name
        }], { onConflict: 'id' })
        .select()
        .single();

      if (workflowError) throw workflowError;

      if (updatedWorkflow) {
        await updateWorkflowProducts(updatedWorkflow.id, settings.workflow.products);
        await updateWorkflowQuestions(updatedWorkflow.id, settings.workflow.questions);
      }
    }

    // Retrieve updated settings
    return await fetchCompanySettings(settings.company_id);
  } catch (error) {
    console.error('Error updating company settings:', error);
    return null;
  }
};

async function updateWorkflowProducts(workflowId: string, newProducts: Product[] = []) {
  // Retrieve all existing products for this workflow
  const { data: existingProducts, error: existingProductsError } = await supabase
    .from('products')
    .select('id')
    .eq('workflow_id', workflowId);

  if (existingProductsError) throw existingProductsError;

  let existingProductIds = existingProducts.map(p => p.id);

  // Deal with each new product
  for (const product of newProducts) {
    const productId = product.id;
    const { error: productError } = await supabase
      .from('products')
      .upsert({
        id: productId,
        workflow_id: workflowId,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        description: product.description,
      });

    if (productError) throw productError;

    existingProductIds = existingProductIds.filter(id => id !== productId);
  }

  // Delete products that no longer exist
  if (existingProductIds.length > 0) {
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .in('id', existingProductIds);

    if (deleteError) throw deleteError;
  }
}

async function updateWorkflowQuestions(workflowId: string, newQuestions: Question[] = []) {
  // Retrieve all existing questions for this workflow
  const { data: existingQuestions, error: existingQuestionsError } = await supabase
    .from('questions')
    .select('id')
    .eq('workflow_id', workflowId);

  if (existingQuestionsError) throw existingQuestionsError;

  let existingQuestionIds = existingQuestions.map(q => q.id);

  // Deal with each new question
  for (const question of newQuestions) {
    await updateOrCreateQuestion(question, workflowId);
    existingQuestionIds = existingQuestionIds.filter(id => id !== question.id);
  }

  // Delete questions that no longer exist
  for (const questionIdToDelete of existingQuestionIds) {
    if (questionIdToDelete) {
      await deleteQuestion(questionIdToDelete);
    }
  }
}

async function updateOrCreateQuestion(question: Question, workflowId: string) {
  // Remove existing mappings and dropdown values
  if (question.id) {
    await supabase.from('question_product_mapping').delete().eq('question_id', question.id);
    await supabase.from('dropdown_values').delete().eq('question_id', question.id);
  }

  // Upsert the question
  const { data: upsertedQuestion, error: questionError } = await supabase
    .from('questions')
    .upsert({
      id: question.id,
      text: question.text,
      type: question.type,
      workflow_id: workflowId
    })
    .select()
    .single();

  if (questionError) throw questionError;

  if (upsertedQuestion) {
    // Insert new dropdown values
    if (question.dropdownValues && question.dropdownValues.length > 0) {
      await supabase
        .from('dropdown_values')
        .insert(question.dropdownValues.map((dropdownValue: any) => ({
          question_id: upsertedQuestion.id,
          value: typeof dropdownValue === 'string' ? dropdownValue : dropdownValue.value
        })));
    }

    // Insert the new mappings
    if (question.mapping) {
      await supabase
        .from('question_product_mapping')
        .insert(Object.entries(question.mapping).map(([key, value]) => ({
          question_id: upsertedQuestion.id,
          product_id: value,
          response_key: key
        })));
    }
  }
}

async function deleteQuestion(questionId: string) {
  await supabase.from('question_product_mapping').delete().eq('question_id', questionId);
  await supabase.from('dropdown_values').delete().eq('question_id', questionId);
  await supabase.from('questions').delete().eq('id', questionId);
}
