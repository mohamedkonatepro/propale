import React from 'react';
import Stepper from '@/components/common/Stepper';
import { useStepperState } from '@/hooks/useStepperState';
import { Step, SubStep, Question } from '@/types/stepper';
import initialStepsData from '../../data/initialSteps.json';
import Select from 'react-select'
import renderQuestionContent from '@/components/common/renderQuestionContent';
import RenderQuestionContent from '@/components/common/renderQuestionContent';

const StepperPage: React.FC = () => {
  const {
    steps,
    activeStep,
    activeSubStep,
    activeQuestion,
    handleStepClick,
    handleSubStepClick,
    handleNextClick,
    handlePreviousClick,
    handleAnswerLater,
  } = useStepperState(initialStepsData.steps);

  // const renderQuestionContent = (step: Step, subStep: SubStep, questionId: string | null) => {
  //   if (!questionId) return <p>Aucune question disponible pour cette étape.</p>;

  //   const question = subStep.questions.find(q => q.id === questionId);
  //   if (!question) return <p>Question non trouvée.</p>;

  //   const options = question.responses.map(response => ({
  //     value: response.code,
  //     label: response.name
  //   }));

  //   return (
  //     <div className="bg-gray-100 p-4 h-full rounded">
  //       <div className="flex w-2/3 h-full justify-center items-center">
  //         <div className="text-sm w-1/2">{question.name}</div>
  //         <div className="w-1/2 ml-5"><Select options={options} /></div>
  //       </div>
  //     </div>
  //   );
  // };

  const currentStep = steps[activeStep];
  const currentSubStep = currentStep?.subSteps.find(ss => ss.id === activeSubStep);

  return (
    <div className="flex flex-col h-screen">
      <header className='flex justify-between p-8 bg-white'>
        <div>
          <h1 className='mb-3 text-2xl text-blueCustom font-bold'>Titre du workflow</h1>
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
            activeStep={activeStep}
            activeSubStep={activeSubStep}
            onStepClick={handleStepClick}
            onSubStepClick={handleSubStepClick}
          />
        </aside>
        <main className="w-3/4 p-12 overflow-y-auto flex flex-col">
          <div className="flex-grow">
            {currentSubStep && (
              <div className="mb-0">
                <h3 className="text-2xl font-semibold text-gray-400">{currentSubStep.name}</h3>
              </div>
            )}
            <div className="h-full">
              {currentStep && currentSubStep && (
                <RenderQuestionContent 
                  step={currentStep} 
                  subStep={currentSubStep} 
                  questionId={activeQuestion} 
                />
              )}
            </div>
          </div>
          <div className="mt-8 flex justify-between">
            <button 
              onClick={handlePreviousClick}
              disabled={activeStep === 0 && !activeSubStep}
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
                className="px-4 py-2 bg-blueCustom text-white rounded disabled:opacity-50 hover:bg-blueCustom"
              >
                {activeStep === steps.length - 1 && !currentSubStep ? "Terminer" : "Suivant"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StepperPage;