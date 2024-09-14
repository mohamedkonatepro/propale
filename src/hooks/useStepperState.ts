import { useState, useCallback, useEffect } from 'react';
import { DbQuestion } from '@/types/dbTypes';

interface Answer {
  questionId: string;
  value: string | string[];
}

interface Step {
  id: string;
  name: string;
  questions: DbQuestion[];
}

export const useStepperState = (
  initialQuestions: any[], 
) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    if (initialQuestions.length > 0) {
      setSteps([{ id: 'default-step', name: 'Questionnaire', questions: initialQuestions }]);
    }
  }, [initialQuestions]);

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


  const setAnswer = (questionId: string, value: string | string[] | undefined) => {
    setAnswers(prevAnswers => {
      if (value === undefined) {
        // If the value is undefined, delete the response
        return prevAnswers.filter(a => a.questionId !== questionId);
      }
      const existingAnswerIndex = prevAnswers.findIndex(a => a.questionId === questionId);
      if (existingAnswerIndex !== -1) {
        // Update an existing answer
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = { questionId, value };
        return updatedAnswers;
      } else {
        // Add a new answer
        return [...prevAnswers, { questionId, value }];
      }
    });
  };


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