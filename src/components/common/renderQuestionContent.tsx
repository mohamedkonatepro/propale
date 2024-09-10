import React, { useEffect, useState } from 'react';
import { Step, SubStep, Question, Response } from '@/types/stepper';
import dynamic from 'next/dynamic';
import { Slider } from '../ui/slider';
import { Checkbox } from './Checkbox';

const Select = dynamic(() => import('react-select'), { ssr: false });

interface RenderQuestionContentProps {
  step: Step;
  subStep: SubStep;
  questionId: string | null;
}

const RenderQuestionContent: React.FC<RenderQuestionContentProps> = ({ step, subStep, questionId }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [sliderValue, setSliderValue] = useState([50]);
  const [checkedResponses, setCheckedResponses] = useState<{[key: string]: boolean}>({});
  const [selectedOptions, setSelectedOptions] = useState<{[key: string]: string[]}>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!questionId) return <p>Aucune question disponible pour cette étape.</p>;

  const question = subStep.questions.find(q => q.id === questionId);
  if (!question) return <p>Question non trouvée.</p>;

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    console.log(value[0]);
  };

  const handleCheckboxChange = (responseId: string, checked: boolean) => {
    setCheckedResponses(prev => ({ ...prev, [responseId]: checked }));
    if (!checked) {
      setSelectedOptions(prev => ({ ...prev, [responseId]: [] }));
    }
  };

  const handleSelectChange = (responseId: string, selectedOptions: any) => {
    setSelectedOptions(prev => ({
      ...prev,
      [responseId]: selectedOptions.map((option: any) => option.value)
    }));
  };

  const renderResponseInput = (question: Question) => {
    if (question.code === "PM1") {
      return (
        <div className='flex'>
          <div className="text-sm w-1/2 mb-4">{question.name}</div>

          <div className='pl-10 w-full flex justify-center items-center'>
            <Slider
              value={sliderValue}
              onValueChange={handleSliderChange}
              max={100}
              step={1}
            />
            <div className='pl-5'>{sliderValue[0]}%</div>
          </div>
        </div>
      );
    } else if (question.code === "SD1") {
      return (
        <div className='flex flex-col'>
          <div className="text-sm mb-4">{question.name}</div>

          <div className="space-y-4">
            {question.responses.map(response => (
              <div key={response.id} className="flex flex-col">
                <div className="flex items-center">
                  <Checkbox
                    id={response.id}
                    checked={checkedResponses[response.id] || false}
                    onCheckedChange={(checked) => handleCheckboxChange(response.id, checked as boolean)}
                  />
                  <label htmlFor={response.id} className="ml-2">{response.name}</label>
                </div>
                {checkedResponses[response.id] && (
                  <div className="mt-2 ml-6">
                    <Select
                      isMulti
                      options={response.options.map(option => ({
                        value: option.code,
                        label: option.name
                      }))}
                      onChange={(selectedOptions) => handleSelectChange(response.id, selectedOptions)}
                      value={selectedOptions[response.id]?.map(value => ({
                        value,
                        label: response.options.find(option => option.code === value)?.name || ''
                      })) || []}
                      placeholder="Sélectionner les options"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      const options = question.responses.map(response => ({
        value: response.code,
        label: response.name
      }));
      return (
        <div className='flex'>
          <div className="text-sm w-1/2 mb-4">{question.name}</div>
          {isMounted ? <div className='w-1/2 pl-10'><Select options={options} placeholder="Sélectionner" /> </div>: null}
        </div>
      );
    }
  };

  return (
    <div className="bg-gray-100 p-4 h-full rounded">
      <div className="flex w-2/3 h-full justify-center items-center">
        <div className="w-full pl-10">
          {renderResponseInput(question)}
        </div>
      </div>
    </div>
  );
};

export default RenderQuestionContent;