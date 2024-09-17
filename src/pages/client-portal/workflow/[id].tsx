import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Stepper from '@/components/common/Stepper';
import { DbCompanySettings, DbProduct, DbQuestion } from '@/types/dbTypes';
import RenderQuestionContent from '@/components/common/renderQuestionContent';
import { fetchCompanySettings } from '@/services/companySettingsService';
import { useStepperState } from '@/hooks/useStepperState';
import { useRouter } from 'next/router';
import { Company, Question } from '@/types/models';
import { GetServerSideProps } from 'next';
import { getStepperSession, saveStepperSession } from '@/services/stepperService';
import { fetchTopMostParentCompanyCompanyById } from '@/services/companyService';
import { IoIosArrowBack } from "react-icons/io";
import { useUser } from '@/context/userContext';

interface StepperPageProps {
  companySettings: DbCompanySettings | null;
  error: string | null;
}

const StepperPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [companySettings, setCompanySettings] = useState<DbCompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [validatedQuestions, setValidatedQuestions] = useState<string[]>([]);
  const [finish, setFinish] = useState<boolean>(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [storedAnswers, setStoredAnswers] = useState<Array<{
    question: DbQuestion;
    answer: string | string[];
    products: DbProduct[];
  }>>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [initialState, setInitialState] = useState<{
    currentStepId?: string;
    currentQuestionId?: string;
    answers?: Record<string, string | string[]>;
  } | undefined>(undefined);


  const loadData = useCallback(async () => {
    if (typeof id !== 'string' || !user?.id) return;

    setLoading(true);
    try {

      const company = await fetchTopMostParentCompanyCompanyById(id);
      setCompany(company);
      if (!company) return;
      const settings = companySettings || await fetchCompanySettings(company.id);
      const savedSession = await getStepperSession(company.id, user.id);
      setCompanySettings(settings);

      if (savedSession) {
        const restoredAnswers = savedSession.responses.map(r => ({
          question: settings?.workflow.questions.find(q => q.id === r.question_id) as DbQuestion,
          answer: JSON.parse(r.answer),
          products: r.product_id ? [settings?.workflow.products.find(p => p.id === r.product_id) as DbProduct] : []
        }));
        setStoredAnswers(restoredAnswers);
        setInitialState({
          currentStepId: savedSession.session.current_step_name,
          currentQuestionId: savedSession.session.current_question_id,
          answers: Object.fromEntries(restoredAnswers.map(({question, answer}) => [question.id, answer]))
        });

        // Initialize answeredQuestions with the IDs of restored answers
        setAnsweredQuestions(restoredAnswers.map(({question}) => question.id));
        setValidatedQuestions(restoredAnswers.map(({question}) => question.id));

        if (savedSession.session.status === 'completed') {
          setFinish(true);
          setCompletedSteps([savedSession.session.current_step_name]);
        }
      }
    } catch (err) {
      setError("Une erreur s'est produite lors du chargement des données");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, user, companySettings]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const {
    steps,
    currentStep,
    currentQuestion,
    activeQuestionId,
    answers,
    handleStepClick,
    handleQuestionClick,
    handleNextClick: originalHandleNextClick,
    handlePreviousClick,
    setAnswer,
    getQuestionResponses,
  } = useStepperState(companySettings?.workflow.questions || [], initialState);

  const storeAnswer = useCallback((question: Question, answer: string | string[], products: DbProduct[]) => {
    if (!question.id) {
      console.error('Question ID is undefined');
      return;
    }

    const dbQuestion: DbQuestion = {
      id: question.id,
      workflow_id: companySettings?.workflow.id || '',
      text: question.text,
      type: question.type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      mapping: question.mapping
    };

    setStoredAnswers(prevAnswers => [
      ...prevAnswers.filter(a => a.question.id !== question.id),
      { question: dbQuestion, answer, products }
    ]);
  }, [companySettings]);

  const handleNextClick = useCallback(async () => {
    if (currentQuestion && currentStep && companySettings) {
      const currentAnswer = storedAnswers.find(a => a.question.id === currentQuestion.id)?.answer;
      if (currentAnswer && currentAnswer !== '') {
        // Mark the question as validated
        setValidatedQuestions(prev => [...new Set([...prev, currentQuestion.id])]);
        
        // Check if all questions in the step are validated
        const allQuestionsValidated = currentStep.questions.every(q => 
          validatedQuestions.includes(q.id) || q.id === currentQuestion.id
        );
        
        if (allQuestionsValidated) {
          setCompletedSteps(prev => [...prev, currentStep.id]);
        }
        
        // Check if this is the last question
        const isLastQuestion = currentStep.questions[currentStep.questions.length - 1].id === currentQuestion.id;
        
        if (isLastQuestion && user) {
          try {
            await saveStepperSession(
              user.id,
              companySettings.company_id,
              companySettings.workflow.id,
              companySettings.workflow.name,
              currentStep.name,
              currentQuestion.id,
              'completed',
              storedAnswers
            );
            setFinish(true);
            setCompletedSteps([currentStep.name]);
          } catch (error) {
            console.error('Error saving session:', error);
            alert('Une erreur est survenue lors de la sauvegarde de la session.');
            // You might want to give the user an option to retry here
          }
        } else {
          // If it's not the last question, proceed to the next question
          originalHandleNextClick();
        }
      } else {
        alert("Veuillez répondre à la question avant de continuer.");
      }
    }
  }, [currentQuestion, currentStep, storedAnswers, validatedQuestions, originalHandleNextClick, companySettings, router]);

  const handleAnswerLater = useCallback(() => {
    if (currentQuestion) {
      // Delete the answer from storedAnswers if it exists
      setStoredAnswers(prevAnswers => prevAnswers.filter(a => a.question.id !== currentQuestion.id));

      // Remove the question from answeredQuestions
      setAnsweredQuestions(prev => prev.filter(q => q !== currentQuestion.id));

      // Delete stepper status response
      setAnswer(currentQuestion.id, undefined);
    }
    
    // Move on to the next question
    originalHandleNextClick();
  }, [currentQuestion, setAnswer, originalHandleNextClick]);

  const handleAnswer = useCallback((questionId: string, answer: string | string[]) => {
    setAnswer(questionId, answer);
    
    setAnsweredQuestions(prev => prev.includes(questionId) ? prev : [...prev, questionId]);  

    if (currentQuestion && companySettings) {
      let products = companySettings.workflow.products.filter(p => currentQuestion.mapping?.['default'] === p.id);

      if (currentQuestion.type === "YesNo" || currentQuestion.type === "Dropdown") {
        products = companySettings.workflow.products.filter(p => 
          Array.isArray(answer) 
            ? answer.includes(currentQuestion.mapping?.[p.id] || '')
            : currentQuestion.mapping?.[p.id] === answer
        );
      }
      
      const questionForStore: Question = {
        id: currentQuestion.id,
        text: currentQuestion.text,
        type: currentQuestion.type,
        mapping: currentQuestion.mapping,
      };

      storeAnswer(questionForStore, answer, products);
    }
  }, [setAnswer, currentQuestion, companySettings, storeAnswer]);

  const handleSaveForLater = async () => {
    if (companySettings && currentStep && currentQuestion && user) {
      try {
        await saveStepperSession(
          user.id,
          companySettings.company_id,
          companySettings.workflow.id,
          companySettings.workflow.name,
          currentStep.name,
          currentQuestion.id,
          'saved',
          storedAnswers,
        );
        router.push(`/client-portal/audit/${id}`); // Redirection vers la page d'accueil
      } catch (error) {
        console.error('Error saving session:', error);
        alert('Une erreur est survenue lors de la sauvegarde de la session.');
      }
    }
  };

  const isAllQuestionsAnswered = useMemo(() => {
    if (!steps || steps.length === 0) return false;
    const totalQuestions = steps.reduce((total, step) => total + step.questions.length, 0);
    return storedAnswers.length === totalQuestions;
  }, [steps, storedAnswers]);

  const isLastQuestion = currentStep && currentQuestion && 
    currentStep.questions[currentStep.questions.length - 1].id === currentQuestion.id;

  const canFinish = isLastQuestion && isAllQuestionsAnswered;


  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;
  if (!companySettings) return <div>Aucune donnée disponible</div>;
  return (
    <div className="flex flex-col h-screen">
      <header className='flex justify-between p-8 bg-white'>
        <div>
          <h1 className='mb-3 text-2xl text-blueCustom font-bold'>{companySettings.workflow.name}</h1>
          <h5 className='text-black'>{company?.name}</h5>
        </div>
        {!finish && <div>
          <span className='text-red-500 cursor-pointer' onClick={handleSaveForLater}>Reprendre plus tard</span>
        </div>}
      </header>      
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/4 overflow-y-auto border-r border-gray-200 p-4 bg-white z-0">
        <Stepper 
          steps={steps}
          activeQuestionId={activeQuestionId}
          answeredQuestions={answeredQuestions}
          validatedQuestions={validatedQuestions}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
          onQuestionClick={handleQuestionClick}
        />
        </aside>
        <main className="w-3/4 p-12 overflow-y-auto flex flex-col">
          <div className="flex-grow">
            {currentQuestion && (
              <div className="mb-0">
                <h3 className="text-2xl font-semibold text-gray-400">{finish ? 'Finalisation' : currentQuestion.text}</h3>
              </div>
            )}
            <div className="h-full">
              {currentQuestion && companySettings.workflow.products && (
                <RenderQuestionContent 
                  question={currentQuestion}
                  products={companySettings.workflow.products}
                  onAnswer={(value) => handleAnswer(currentQuestion.id, value)}
                  responses={getQuestionResponses(currentQuestion.id)}
                  storeAnswer={storeAnswer}
                  currentAnswer={storedAnswers.find(a => a.question.id === currentQuestion.id)?.answer}
                  finish={finish}
                  companyId={id as string}
                />
              )}
            </div>
          </div>
          {!finish && <div className="mt-8 flex justify-between">
            <div className='flex justify-center items-center'>
              <IoIosArrowBack className='text-blueCustom' />
              <button 
                onClick={handlePreviousClick}
                disabled={!currentStep || !currentQuestion || currentStep.questions[0].id === currentQuestion.id}
                className="px-2 py-2 bg-none text-labelGray rounded disabled:opacity-50"
              >
                Précédent
              </button>
            </div>
            <div>
              <button 
                onClick={handleAnswerLater}
                className="px-4 py-2 bg-none text-gray-700 rounded mr-2"
              >
                Répondre plus tard
              </button>
              <button 
                onClick={handleNextClick}
                disabled={isLastQuestion && !canFinish}
                className="px-4 py-2 bg-blueCustom text-white rounded disabled:opacity-50 hover:bg-blueCustom"
              >
                {currentStep && currentQuestion && currentStep.questions[currentStep.questions.length - 1].id === currentQuestion.id ? "Terminer" : "Suivant"}
              </button>
            </div>
          </div>}
        </main>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<StepperPageProps> = async (context) => {
  const { id } = context.params as { id: string };
  
  try {
    const companySettings = await fetchCompanySettings(id);
    return {
      props: {
        companySettings,
        error: null,
      },
    };
  } catch (error) {
    console.error("Error fetching company settings:", error);
    return {
      props: {
        companySettings: null,
        error: "Une erreur s'est produite lors du chargement des données",
      },
    };
  }
};

export default StepperPage;