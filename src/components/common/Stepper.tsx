import React, { useState } from 'react';
import { DbQuestion } from '@/types/dbTypes';

interface Step {
  id: string;
  name: string;
  questions: DbQuestion[];
}

type StepperProps = {
  steps: Step[];
  activeQuestionId: string | null;
  answeredQuestions: string[]; // New prop for answered questions
  onStepClick: (stepId: string) => void;
  onQuestionClick: (questionId: string) => void;
};

const Stepper: React.FC<StepperProps> = ({ 
  steps, 
  activeQuestionId,
  answeredQuestions,
  onStepClick,
  onQuestionClick
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  return (
    <div className="space-y-4">
      {steps.map((step, stepIndex) => {
        const isActiveStep = step.questions.some(q => q.id === activeQuestionId);
        const isCompletedStep = step.questions.every(q => answeredQuestions.includes(q.id));

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
                  isActiveStep ? 'text-blueCustom' : 
                  isCompletedStep ? 'text-black' : 'text-gray-500'
                }`}>
                  {step.name}
                </h3>
              </div>
            </div>
            {isActiveStep && (
              <div className="mt-2 space-y-2 ml-[20px]">
                {step.questions.map((question, questionIndex) => {
                  const isActiveQuestion = question.id === activeQuestionId;
                  const isCompletedQuestion = answeredQuestions.includes(question.id);

                  return (
                    <div
                      key={question.id}
                      className={`flex items-center cursor-pointer ${
                        isCompletedQuestion ? 'text-green-500' : 
                        isActiveQuestion ? 'text-blueCustom' : 
                        'text-gray-500'
                      }`}
                      onClick={() => onQuestionClick(question.id)}
                      onMouseEnter={() => setHoveredItem(question.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        isCompletedQuestion ? 'bg-green-500' : 
                        isActiveQuestion ? 'bg-blueCustom' : 
                        'bg-gray-300'
                      }`} />
                      <span className="text-sm ml-10">{question.text}</span>
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