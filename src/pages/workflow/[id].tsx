import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Stepper from '@/components/common/Stepper';
import { DbCompanySettings, DbProduct, DbQuestion } from '@/types/dbTypes';
import RenderQuestionContent from '@/components/common/renderQuestionContent';
import { fetchCompanySettings } from '@/services/companySettingsService';
import { useStepperState } from '@/hooks/useStepperState';
import { useRouter } from 'next/router';
import { Question } from '@/types/models';

const StepperPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [companySettings, setCompanySettings] = useState<DbCompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storedAnswers, setStoredAnswers] = useState<Array<{
    question: DbQuestion;
    answer: string | string[];
    products: DbProduct[];
  }>>([]);

  const {
    steps,
    currentStep,
    currentQuestion,
    activeQuestionId,
    answers,
    handleStepClick,
    handleQuestionClick,
    handleNextClick,
    handlePreviousClick,
    setAnswer,
    getQuestionResponses,
  } = useStepperState(companySettings?.workflow.questions || []);

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

  const handleAnswer = useCallback((questionId: string, answer: string | string[]) => {
    setAnswer(questionId, answer);
    if (currentQuestion && companySettings) {
      const products = companySettings.workflow.products.filter(p => 
        Array.isArray(answer) 
          ? answer.includes(currentQuestion.mapping?.[p.id] || '')
          : currentQuestion.mapping?.[p.id] === answer
      );
      
      const questionForStore: Question = {
        id: currentQuestion.id,
        text: currentQuestion.text,
        type: currentQuestion.type,
        mapping: currentQuestion.mapping,
      };

      storeAnswer(questionForStore, answer, products);
    }
  }, [setAnswer, currentQuestion, companySettings, storeAnswer]);

  const handleAnswerLater = useCallback(() => {
    if (currentQuestion) {
      // Delete the answer from storedAnswers if it exists
      setStoredAnswers(prevAnswers => prevAnswers.filter(a => a.question.id !== currentQuestion.id));
      
      // Delete stepper status response
      setAnswer(currentQuestion.id, undefined);
    }
    
    // Move on to the next question
    handleNextClick();
  }, [currentQuestion, setAnswer, handleNextClick]);

  useEffect(() => {
    const loadCompanySettings = async () => {
      if (typeof id === 'string') {
        setLoading(true);
        try {
          const settings = await fetchCompanySettings(id);
          setCompanySettings(settings);
        } catch (err) {
          setError("Une erreur s'est produite lors du chargement des données");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCompanySettings();
  }, [id]);

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
          <h5 className='text-black'>Raison sociale</h5>
        </div>
        <div>
          <span className='text-red-500'>Reprendre plus tard</span>
        </div>
      </header>      
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/4 overflow-y-auto border-r border-gray-200 p-4 bg-white z-0">
        <Stepper 
          steps={steps}
          activeQuestionId={activeQuestionId}
          answeredQuestions={storedAnswers.map(a => a.question.id)}
          onStepClick={handleStepClick}
          onQuestionClick={handleQuestionClick}
        />
        </aside>
        <main className="w-3/4 p-12 overflow-y-auto flex flex-col">
          <div className="flex-grow">
            {currentQuestion && (
              <div className="mb-0">
                <h3 className="text-2xl font-semibold text-gray-400">{currentQuestion.text}</h3>
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
                />
              )}
            </div>
          </div>
          <div className="mt-8 flex justify-between">
            <button 
              onClick={handlePreviousClick}
              disabled={!currentStep || !currentQuestion || currentStep.questions[0].id === currentQuestion.id}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-400"
            >
              Précédent
            </button>
            <div>
              <button 
                onClick={handleAnswerLater}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mr-2"
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default StepperPage;