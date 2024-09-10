import React, { useState } from 'react';
import { Step } from '@/types/stepper';

type StepperProps = {
  steps: Step[];
  activeStep: number;
  activeSubStep: string | null;
  onStepClick: (stepId: string) => void;
  onSubStepClick: (stepId: string, subStepId: string) => void;
};

const Stepper: React.FC<StepperProps> = ({ 
  steps, 
  activeStep, 
  activeSubStep,
  onStepClick, 
  onSubStepClick
}) => {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);
  
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isActiveStep = index === activeStep;
        const activeSubStepIndex = isActiveStep ? step.subSteps.findIndex(ss => ss.id === activeSubStep) : -1;

        return (
          <div key={step.id} className="relative">
            {index !== steps.length - 1 && (
              <>
                <div className="absolute left-6 top-8 w-1 h-full bg-gray-300 -z-20" />
                {step.isCompleted && (
                  <div className="absolute left-6 top-8 w-1 h-full bg-green-500 -z-15" />
                )}
                {isActiveStep && (
                  <div 
                    className="absolute left-6 top-8 w-1 bg-blueCustom -z-10" 
                    style={{
                      height: activeSubStepIndex >= 0 
                        ? `calc(${(activeSubStepIndex + 1) * 2.5}rem - 0.5rem)` 
                        : '100%'
                    }}
                  />
                )}
              </>
            )}
            <div 
              className={`flex items-start space-x-4 cursor-pointer group pl-2 ${
                index <= activeStep ? 'opacity-100' : 'opacity-50'
              }`}
              onClick={() => onStepClick(step.id)}
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step.isCompleted 
                  ? 'bg-green-500 border-green-500' 
                  : isActiveStep
                  ? 'bg-blueCustom border-blueCustom'
                  : hoveredStep === step.id
                  ? 'bg-gray-200 border-gray-400'
                  : 'bg-white border-gray-300'
              }`}>
                {step.isCompleted ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={`text-base font-semibold ${isActiveStep ? 'text-white' : 'text-gray-500'}`}>
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="flex-grow pl-4">
                <h3 className={`text-sm font-semibold ${
                  isActiveStep ? 'text-blueCustom' : 
                  index < activeStep ? 'text-black' : 'text-gray-500'
                }`}>
                  {step.name}
                </h3>
              </div>
            </div>
            {step.subSteps.length > 0 && isActiveStep && (
              <div className="mt-2 space-y-2 ml-[20px]">
                {step.subSteps.map((subStep, subIndex) => (
                  <div
                    key={subStep.id}
                    className={`flex items-center cursor-pointer ${
                      subStep.isCompleted ? 'text-green-500' : 
                      subStep.id === activeSubStep ? 'text-blueCustom' : 
                      subIndex < activeSubStepIndex ? 'text-black' : 'text-gray-500'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSubStepClick(step.id, subStep.id);
                    }}
                    style={{ height: '2rem' }}
                  >
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      subStep.isCompleted ? 'bg-green-500' : 
                      subStep.id === activeSubStep ? 'bg-blueCustom' : 
                      subIndex < activeSubStepIndex ? 'bg-blueCustom' : 'bg-gray-300'
                    }`} />
                    <span className="text-sm ml-10">{subStep.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
