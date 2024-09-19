import { supabase } from '@/lib/supabaseClient';
import { DbQuestion, DbProduct } from '@/types/dbTypes';

export const saveStepperSession = async (
  profileId: string,
  companyId: string,
  prospectId: string,
  workflowId: string,
  workflowName: string,
  currentStepName: string,
  currentQuestionId: string,
  status: string = 'saved',
  storedAnswers: Array<{
    question: DbQuestion;
    answer: string | string[];
    products: DbProduct[];
  }>
) => {
  const { data: session, error: sessionError } = await supabase
    .from('stepper_sessions')
    .upsert([{
      company_id: companyId,
      profile_id: profileId,
      prospect_id: prospectId,
      workflow_id: workflowId,
      workflow_name: workflowName,
      status,
      current_step_name: currentStepName,
      current_question_id: currentQuestionId,
    }], {
      onConflict: 'company_id,workflow_id,profile_id,prospect_id',
    })
    .select()
    .single();

  if (sessionError) throw sessionError;

  // Delete existing responses for this session
  const { error: deleteError } = await supabase
    .from('stepper_responses')
    .delete()
    .eq('session_id', session.id);

  if (deleteError) throw deleteError;

  // Insert new responses
  const { error: responsesError } = await supabase
    .from('stepper_responses')
    .insert(
      storedAnswers.map(({ question, answer, products }) => ({
        session_id: session.id,
        question_id: question.id,
        question_text: question.text,
        product_id: products[0]?.id,
        product_price: products[0]?.price,
        product_quantity: products[0]?.quantity,
        answer: JSON.stringify(answer),
        is_validated: true,
      }))
    );

  if (responsesError) throw responsesError;
};

export const getStepperSession = async (companyId: string, profileId: string, prospectId: string) => {
  const { data: session, error: sessionError } = await supabase
    .from('stepper_sessions')
    .select('*')
    .eq('company_id', companyId)
    .eq('profile_id', profileId)
    .eq('prospect_id', prospectId)
    .single();

  if (sessionError) return null;

  const { data: responses, error: responsesError } = await supabase
    .from('stepper_responses')
    .select('*')
    .eq('session_id', session.id);

  if (responsesError) throw responsesError;

  return { session, responses };
};

export const countStepperSessionByCompanyId = async (companyId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('stepper_sessions')
    .select('company_id', { count: 'exact' })
    .eq('company_id', companyId);

  if (error) {
    console.error('Error counting stepper:', error);
    return 0;
  }

  return count ?? 0;
};