import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Checkbox } from './Checkbox';
import { DbProduct } from '@/types/dbTypes';
import { Question } from '@/types/models';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from './DatePickerWithRange';
import { Button } from './Button';
import Link from 'next/link';
import { FaArrowRight } from "react-icons/fa";

const Select = dynamic(() => import('react-select'), { ssr: false });

interface RenderQuestionContentProps {
  question: Question;
  products: DbProduct[];
  onAnswer: (value: string | string[]) => void;
  responses: { value: string; label: string }[];
  storeAnswer: (question: Question, answer: string | string[], products: DbProduct[]) => void;
  currentAnswer: string | string[] | undefined;
  finish: boolean;
  companyId: string;
}

const RenderQuestionContent: React.FC<RenderQuestionContentProps> = ({ 
  question, 
  products,
  onAnswer,
  responses,
  storeAnswer,
  currentAnswer,
  finish,
  companyId
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

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'YesNo':
        return (
          <div className='flex flex-col'>
            <div className="pl-10 text-sm mb-4">{question.text}</div>
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
        return (
          <div className='flex flex-col'>
            <div className="text-sm pl-10 mb-4">{question.text}</div>
            <div className='pl-10'>
              <Select
                isMulti
                options={options}
                placeholder="Sélectionner"
                value={
                  Array.isArray(currentAnswer) 
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
          <div className='flex flex-col items-center'>
            <div className="text-sm text-left pl-10 mb-4">{question.text}</div>
            <div className='pl-10'>
              <DatePickerWithRange
                className="w-full"
                date={dateRange}
                setDate={handleDateRangeChange}
              />
            </div>
          </div>
        );
      case 'FreeText':
        return (
          <div className='flex flex-col'>
            <div className="text-sm pl-10 text-left mb-4">{question.text}</div>
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
          {!finish && renderQuestionInput()}
          {finish && (
          <div className='flex flex-col justify-center items-center'>
            <h4 className="text-xl font-semibold mb-4">{'Félicitations, vous avez terminé l’audit !'}</h4>
            <div className='pl-10'>
              <Link href={`/client-portal/audit/${companyId}`}>
                <Button className="flex items-center text-white border border-2 bg-blueCustom py-2 px-4 rounded-lg shadow-md hover:bg-blueCustom">
                  Consulter le résultat
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