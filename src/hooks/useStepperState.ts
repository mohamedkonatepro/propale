import { useState, useCallback, useEffect } from 'react';
import { DbQuestion } from '@/types/dbTypes';

interface Step {
  id: string;
  name: string;
  questions: DbQuestion[];
}

export const useStepperState = (
  initialQuestions: any[], 
  finish: boolean,
  initialState?: {
    currentStepId?: string;
    currentQuestionId?: string;
    answers?: Record<string, string | string[]>;
  },
) => {
  const [steps, setSteps] = useState<Step[]>([]);

  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    if (initialState?.currentStepId) {
      return steps.findIndex(step => step.id === initialState.currentStepId);
    }
    return 0;
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    if (initialState?.currentQuestionId) {
      return steps[currentStepIndex]?.questions.findIndex(q => q.id === initialState.currentQuestionId) || 0;
    }
    return 0;
  });

  const [answers, setAnswers] = useState<Record<string, string | string[]>>(initialState?.answers || {});

  useEffect(() => {
    if (initialQuestions.length > 0) {
      const finishQuestions = initialQuestions.filter(question =>
        initialState?.answers?.[question.id]
      );
      setSteps([{ id: 'default-step', name: 'Questionnaire', questions: finish ? finishQuestions : initialQuestions }]);
    }
  }, [initialQuestions, initialState]);
  
  useEffect(() => {
    if (initialState?.currentStepId) {
      const index = steps.findIndex(step => step.id === initialState.currentStepId);
      if (index !== -1) {
        setCurrentStepIndex(index);
      }
    }
  }, [steps, initialState]);

  useEffect(() => {
    if (initialState?.currentQuestionId && steps[currentStepIndex]) {
      const index = steps[currentStepIndex].questions.findIndex(q => q.id === initialState.currentQuestionId);
      if (index !== -1) {
        setCurrentQuestionIndex(index);
      }
    }
  }, [steps, currentStepIndex, initialState]);

  const currentStep = steps[currentStepIndex];
  const currentQuestion = currentStep?.questions[currentQuestionIndex];
  const activeQuestionId = currentQuestion?.id || null;

  const handleStepClick = useCallback((stepId: string) => {
    const index = steps.findIndex(s => s.id === stepId);
    if (index !== -1 && index <= currentStepIndex) {
      setCurrentStepIndex(index);
      setCurrentQuestionIndex(0);
    }
  }, [steps, currentStepIndex]);

  const handleQuestionClick = useCallback((questionId: string) => {
    if (!currentStep) return;
    const questionIndex = currentStep.questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1 && questionIndex <= currentQuestionIndex) {
      setCurrentQuestionIndex(questionIndex);
    }
  }, [currentStep, currentQuestionIndex]);

  const handleNextClick = useCallback(() => {
    if (!currentStep) return;
    if (currentQuestionIndex < currentStep.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prevIndex => prevIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      console.log("Questionnaire terminé");
    }
  }, [currentStep, currentQuestionIndex, currentStepIndex, steps.length]);

  const handlePreviousClick = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    } else if (currentStepIndex > 0) {
      setCurrentStepIndex(prevIndex => prevIndex - 1);
      setCurrentQuestionIndex(steps[currentStepIndex - 1].questions.length - 1);
    }
  }, [currentQuestionIndex, currentStepIndex, steps]);

  const handleAnswerLater = useCallback(() => {
    handleNextClick();
  }, [handleNextClick]);

  const setAnswer = useCallback((questionId: string, value: string | string[] | undefined) => {
    setAnswers(prevAnswers => {
      if (value === undefined) {
        // If the value is undefined, delete the answer
        const { [questionId]: _, ...rest } = prevAnswers;
        return rest;
      } else {
        // Add or update the answer
        return { ...prevAnswers, [questionId]: value };
      }
    });
  }, []);

  const getQuestionResponses = useCallback((questionId: string) => {
    const question = initialQuestions.find(q => q.id === questionId);
    if (!question) return [];

    switch (question.type) {
      case 'YesNo':
        return [
          { value: 'Yes', label: 'Oui' },
          { value: 'No', label: 'Non' }
        ];
      case 'Dropdown':
        return question.dropdownValues.map((dv: any) => ({ value: dv.id, label: dv.value }));
      default:
        return [];
    }
  }, [initialQuestions]);

  return {
    steps,
    currentStep,
    currentQuestion,
    activeQuestionId,
    answers,
    handleStepClick,
    handleQuestionClick,
    handleNextClick,
    handlePreviousClick,
    handleAnswerLater,
    setAnswer,
    getQuestionResponses,
  };
};