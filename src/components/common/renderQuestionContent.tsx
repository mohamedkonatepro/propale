import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { DbProduct, DbQuestion } from '@/types/dbTypes';
import { Question } from '@/types/models';
import { DateRange } from 'react-day-picker';
import { Button } from './Button';
import Link from 'next/link';
import { FaArrowRight } from "react-icons/fa";
import { DateRangePicker } from './DateRangePicker';

const Select = dynamic(() => import('react-select'), { ssr: false });

interface RenderQuestionContentProps {
  question: Question;
  products: DbProduct[];
  onAnswer: (value: string | string[]) => void;
  responses: { value: string; label: string }[];
  storeAnswer: (question: Question, answer: string | string[], products: DbProduct[]) => void;
  currentAnswer: string | string[] | undefined;
  currentQuestion: string | undefined;
  finish: boolean;
  companyId: string;
  navigateStep: boolean;
}

const detectQuestionType = (currentAnswer: string | string[] | undefined): string => {
  if (!currentAnswer) {
    return "FreeText";
  }

  if (Array.isArray(currentAnswer)) {
    if (currentAnswer.every((item) => typeof item === "string")) {
      return "Dropdown";
    }
  } else if (typeof currentAnswer === "string") {
    if (currentAnswer.includes(",")) {
      const dates = currentAnswer.split(",").map((date) => new Date(date));
      if (dates.every((date) => !isNaN(date.getTime()))) {
        return "DateRange";
      }
    }

    if (currentAnswer.toLowerCase() === "yes" || currentAnswer.toLowerCase() === "no") {
      return "YesNo";
    }

    return "FreeText";
  }

  return "FreeText";
}


const RenderQuestionContent: React.FC<RenderQuestionContentProps> = ({ 
  question, 
  products,
  onAnswer,
  responses,
  storeAnswer,
  currentAnswer,
  finish,
  companyId,
  navigateStep,
  currentQuestion
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    if (question.type === 'DateRange' && typeof currentAnswer === 'string' && currentAnswer) {
      const [fromDate, toDate] = currentAnswer.split(',').map(date => new Date(date));
      setDateRange({ from: fromDate, to: toDate });
    }
  }, [question.type, currentAnswer]);

  const handleChange = (value: string | string[]) => {
    onAnswer(value);
    const productIds = Array.isArray(value) 
      ? value.flatMap(v => question.mapping?.[v] || [])
      : [question.mapping?.[value as string]].filter(Boolean);
    const associatedProducts = products.filter(p => productIds.includes(p.id));
    if (associatedProducts.length > 0) {
      storeAnswer(question, value, associatedProducts);
    }
  };

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    if (newDateRange?.from && newDateRange?.to) {
      const dateRangeString = `${newDateRange.from.toISOString()},${newDateRange.to.toISOString()}`;
      handleChange(dateRangeString);
    } else {
      handleChange('');
    }
  };

  if (finish) {
    question.type = detectQuestionType(currentAnswer) as  "YesNo" | "Dropdown" | "DateRange" | "FreeText";
  }

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'YesNo':
        return (
          <div className='flex flex-col'>
            <div className="text-3xl text-left text-gray-700 font-medium pl-10 mb-4">{finish ? currentQuestion : question.text}</div>
            <div className='pl-10'>
              <Select 
                options={responses}
                placeholder="Sélectionner"
                value={currentAnswer ? responses.find(r => r.value === currentAnswer) : null}
                onChange={(selectedOption: any) => handleChange(selectedOption.value)}
              />
            </div>
          </div>
        );
      case 'Dropdown':
        const options = question.dropdownValues?.map(dv => ({
          value: dv.value,
          label: dv.value
        }));

        const currentAnswerOptions = Array.isArray(currentAnswer)
        ? currentAnswer.map((dv) => ({
            value: dv,
            label: dv,
          }))
        : [];

        console.log(options, currentAnswer)
        return (
          <div className='flex flex-col'>
            <div className="text-3xl text-left text-gray-700 font-medium pl-10 mb-4">{finish ? currentQuestion : question.text}</div>
            <div className='pl-10'>
              <Select
                isMulti
                options={options}
                placeholder="Sélectionner"
                value={
                  finish
                    ? currentAnswerOptions
                    : Array.isArray(currentAnswer)
                    ? options?.filter(o => currentAnswer.includes(o.value))
                    : currentAnswer
                    ? options?.find(o => o.value === currentAnswer)
                    : null
                }
                onChange={(selectedOptions: any) => handleChange(selectedOptions.map((option: any) => option.value))}
              />
            </div>
          </div>
        );  
        case 'DateRange':
          return (
            <div className="flex flex-col justify-center items-center">
              <div className="text-3xl text-left text-gray-700 font-medium pl-10 mb-4">{finish ? currentQuestion : question.text}</div>
              <div className="pl-10 mt-5 w-full">
                <DateRangePicker
                  startDate={dateRange?.from}
                  endDate={dateRange?.to}
                  onStartDateChange={(newStartDate) => {
                    const updatedRange: DateRange | undefined = newStartDate
                      ? { from: newStartDate, to: dateRange?.to }
                      : undefined;
                  
                    setDateRange(updatedRange);
                    if (updatedRange?.from && updatedRange?.to) {
                      handleDateRangeChange(updatedRange);
                    } else {
                      handleChange(''); // Reset if incomplete
                    }
                  }}
                  onEndDateChange={(newEndDate) => {
                    const updatedRange: DateRange | undefined = newEndDate
                      ? { from: dateRange?.from, to: newEndDate }
                      : undefined;
                  
                    setDateRange(updatedRange);
                    if (updatedRange?.from && updatedRange?.to) {
                      handleDateRangeChange(updatedRange);
                    } else {
                      handleChange(''); // Reset if incomplete
                    }
                  }}                  
                />
              </div>
            </div>
          );        
      case 'FreeText':
        return (
          <div className='flex flex-col'>
            <div className="text-3xl text-left text-gray-700 font-medium pl-10 mb-4">{finish ? currentQuestion : question.text}</div>
            <div className='w-full pl-10 flex items-center'>
              <textarea 
                value={currentAnswer as string || ''}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Entrez votre réponse"
                rows={3}
              />
            </div>
          </div>
        );
      default:
        return <p>Type de question non pris en charge.</p>;
    }
  };
  
  return (
    <div className="bg-gray-100 p-4 h-full rounded">
      <div className={`flex w-full h-full justify-center items-center`}>
        <div className="w-full">
          {!finish || navigateStep ? renderQuestionInput() : (
          <div className='flex flex-col justify-center items-center'>
            <h4 className="text-xl font-semibold mb-4">{'Félicitations, vous avez terminé l’audit !'}</h4>
            <div className='pl-10'>
              <Link href={`/client-portal/proposal/${companyId}/list`}>
                <Button className="flex items-center text-white border border-2 bg-blueCustom py-2 px-4 rounded-lg shadow-md hover:bg-blueCustom">
                  Consulter la proposition
                  <FaArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RenderQuestionContent;