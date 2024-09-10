import { Step, SubStep } from '@/types/stepper';
import { useState } from 'react';

export const useStepperState = (initialSteps: Step[]) => {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activeSubStep, setActiveSubStep] = useState<string>(steps[0].subSteps[0].id);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(
    steps[0].subSteps[0].questions.length > 0 ? steps[0].subSteps[0].questions[0].id : null
  );

  const findStepAndSubStep = (subStepId: string): [Step, SubStep] | [null, null] => {
    for (const step of steps) {
      const subStep = step.subSteps.find(ss => ss.id === subStepId);
      if (subStep) return [step, subStep];
    }
    return [null, null];
  };

  const handleStepClick = (stepId: string): void => {
    const clickedStepIndex = steps.findIndex(step => step.id === stepId);
    if (clickedStepIndex <= activeStep) {
      setActiveStep(clickedStepIndex);
      const newActiveSubStep = steps[clickedStepIndex].subSteps[0];
      setActiveSubStep(newActiveSubStep.id);
      setActiveQuestion(newActiveSubStep.questions.length > 0 ? newActiveSubStep.questions[0].id : null);
    }
  };

  const handleSubStepClick = (stepId: string, subStepId: string): void => {
    setActiveSubStep(subStepId);
    const [, subStep] = findStepAndSubStep(subStepId);
    if (subStep) {
      setActiveQuestion(subStep.questions.length > 0 ? subStep.questions[0].id : null);
    }
  };

  const moveToNextQuestion = (currentStep: Step, currentSubStep: SubStep): void => {
    const currentQuestionIndex = currentSubStep.questions.findIndex(q => q.id === activeQuestion);
    if (currentQuestionIndex < currentSubStep.questions.length - 1) {
      // Move to the next question in the current subStep
      setActiveQuestion(currentSubStep.questions[currentQuestionIndex + 1].id);
    } else {
      // Move to the next subStep or step
      const currentSubStepIndex = currentStep.subSteps.findIndex(ss => ss.id === currentSubStep.id);
      if (currentSubStepIndex < currentStep.subSteps.length - 1) {
        // Move to the next subStep
        const nextSubStep = currentStep.subSteps[currentSubStepIndex + 1];
        setActiveSubStep(nextSubStep.id);
        setActiveQuestion(nextSubStep.questions.length > 0 ? nextSubStep.questions[0].id : null);
      } else {
        // Move to the next step
        if (activeStep < steps.length - 1) {
          setActiveStep(prevActiveStep => prevActiveStep + 1);
          const nextStep = steps[activeStep + 1];
          setActiveSubStep(nextStep.subSteps[0].id);
          setActiveQuestion(nextStep.subSteps[0].questions.length > 0 ? nextStep.subSteps[0].questions[0].id : null);
        } else {
          // We've reached the end
          console.log("Questionnaire completed");
        }
      }
    }
  };

  const handleNextClick = (): void => {
    const currentStep = steps[activeStep];
    const [, currentSubStep] = findStepAndSubStep(activeSubStep);
    
    if (currentStep && currentSubStep) {
      setSteps(prevSteps => {
        return prevSteps.map(step => {
          if (step.id === currentStep.id) {
            return {
              ...step,
              subSteps: step.subSteps.map(subStep => {
                if (subStep.id === currentSubStep.id) {
                  return {
                    ...subStep,
                    questions: subStep.questions.map(question => {
                      if (question.id === activeQuestion) {
                        return { ...question, isCompleted: true };
                      }
                      return question;
                    })
                  };
                }
                return subStep;
              })
            };
          }
          return step;
        });
      });

      moveToNextQuestion(currentStep, currentSubStep);
    }
  };

  const handlePreviousClick = (): void => {
    const currentStep = steps[activeStep];
    const [, currentSubStep] = findStepAndSubStep(activeSubStep);
    
    if (currentStep && currentSubStep) {
      const currentQuestionIndex = currentSubStep.questions.findIndex(q => q.id === activeQuestion);
      if (currentQuestionIndex > 0) {
        // Move to the previous question in the current subStep
        setActiveQuestion(currentSubStep.questions[currentQuestionIndex - 1].id);
      } else {
        // Move to the previous subStep or step
        const currentSubStepIndex = currentStep.subSteps.findIndex(ss => ss.id === currentSubStep.id);
        if (currentSubStepIndex > 0) {
          // Move to the previous subStep
          const prevSubStep = currentStep.subSteps[currentSubStepIndex - 1];
          setActiveSubStep(prevSubStep.id);
          setActiveQuestion(prevSubStep.questions[prevSubStep.questions.length - 1].id);
        } else if (activeStep > 0) {
          // Move to the previous step
          setActiveStep(prevActiveStep => prevActiveStep - 1);
          const prevStep = steps[activeStep - 1];
          const lastSubStep = prevStep.subSteps[prevStep.subSteps.length - 1];
          setActiveSubStep(lastSubStep.id);
          setActiveQuestion(lastSubStep.questions[lastSubStep.questions.length - 1].id);
        }
      }
    }
  };

  const handleAnswerLater = (): void => {
    handleNextClick(); // For now, we'll just move to the next question without marking it as completed
  };

  return {
    steps,
    activeStep,
    activeSubStep,
    activeQuestion,
    handleStepClick,
    handleSubStepClick,
    handleNextClick,
    handlePreviousClick,
    handleAnswerLater,
  };
};
