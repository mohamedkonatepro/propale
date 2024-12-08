import React, { useState } from 'react';
import { DbQuestion } from '@/types/dbTypes';
import { truncateString } from '@/lib/utils';

interface Step {
  id: string;
  name: string;
  questions: DbQuestion[];
}

type StepperProps = {
  steps: Step[];
  activeQuestionId: string | null;
  answeredQuestions: string[];
  validatedQuestions: string[];
  completedSteps: string[];
  onStepClick: (stepId: string) => void;
  onQuestionClick: (questionId: string) => void;
};

const Stepper: React.FC<StepperProps> = ({ 
  steps, 
  activeQuestionId,
  answeredQuestions,
  validatedQuestions,
  completedSteps,
  onStepClick,
  onQuestionClick
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {steps.map((step, stepIndex) => {
        const isActiveStep = step.questions.some(q => q.id === activeQuestionId);
        const isCompletedStep = completedSteps.includes(step.name);

        return (
          <div key={step.id} className="relative">
            {stepIndex !== steps.length - 1 && (
              <>
                <div className="absolute left-6 top-8 w-1 h-full bg-gray-300 -z-20" />
                {isCompletedStep && (
                  <div className="absolute left-6 top-8 w-1 h-full bg-green-500 -z-15" />
                )}
                {isActiveStep && (
                  <div 
                    className="absolute left-6 top-8 w-1 bg-blueCustom -z-10" 
                    style={{ height: '100%' }}
                  />
                )}
              </>
            )}
            
            {/* Hide step name if there is only one step */}
            {steps.length > 1 && (
              <div 
                className={`flex items-start space-x-4 cursor-pointer group pl-2 ${
                  stepIndex <= steps.findIndex(s => s.questions.some(q => q.id === activeQuestionId)) ? 'opacity-100' : 'opacity-50'
                }`}
                onClick={() => onStepClick(step.id)}
                onMouseEnter={() => setHoveredItem(step.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  isCompletedStep 
                    ? 'bg-green-500 border-green-500' 
                    : isActiveStep
                    ? 'bg-blueCustom border-blueCustom'
                    : hoveredItem === step.id
                    ? 'bg-gray-200 border-gray-400'
                    : 'bg-white border-gray-300'
                }`}>
                  {isCompletedStep ? (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={`text-base font-semibold ${isActiveStep ? 'text-white' : 'text-gray-500'}`}>
                      {stepIndex + 1}
                    </span>
                  )}
                </div>
                <div className="flex-grow pl-4">
                  <h3 className={`text-sm font-semibold ${
                    isCompletedStep ? 'text-black' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </h3>
                </div>
              </div>
            )}
            
            {/* Display only the active question */}
            {isActiveStep && (
              <div className="mt-2 space-y-2 ml-[20px]">
                {step.questions.map((question, questionIndex) => {
                  const isActiveQuestion = question.id === activeQuestionId;
                  const isAnsweredQuestion = answeredQuestions.includes(question.id);
                  const isValidatedQuestion = validatedQuestions.includes(question.id);

                  // Determine the color of the line between this question and the next
                  const lastQuestion = step.questions[step.questions.length - 1];

                  return (
                    <div key={question.id} className="relative">
                      {/* Conditional vertical line between questions */}
                      {lastQuestion !== question && (
                        <>
                          <div className="absolute left-2 top-10 w-1 h-full bg-gray-300 -z-40" />
                          {isAnsweredQuestion && (
                            <div className="absolute left-2 top-10 w-1 h-full bg-green-500 -z-30" />
                          )}
                          {isActiveQuestion && !isAnsweredQuestion && (
                            <div 
                              className="absolute left-2 top-10 w-1 bg-blueCustom -z-10" 
                              style={{ height: '100%' }}
                            />
                          )}
                        </>
                      )}

                      <div
                        className={`flex items-center cursor-pointer pt-5 ${
                          isValidatedQuestion && isAnsweredQuestion ? 'text-green-500' : 
                          isActiveQuestion ? 'text-blueCustom' : 
                          isAnsweredQuestion ? 'text-yellow-500' :
                          'text-gray-500'
                        }`}
                        onClick={() => onQuestionClick(question.id)}
                        onMouseEnter={() => setHoveredItem(question.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                          isValidatedQuestion && isAnsweredQuestion ? 'bg-green-500' : 
                          isActiveQuestion ? 'bg-blueCustom' : 
                          isAnsweredQuestion ? 'bg-yellow-500' :
                          'bg-gray-300'
                        }`}>
                          {/* <span className="text-xs text-white">{questionIndex + 1}</span> */}
                        </div>
                        <span className="text-sm ml-4">Étape {questionIndex + 1}</span>
                        {/* {isActiveQuestion ? <span className="text-sm ml-4">{truncateString(question.text, 50)}</span> : ''} */}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
