import React from 'react';
import dynamic from 'next/dynamic';
import { Checkbox } from './Checkbox';
import { DbProduct } from '@/types/dbTypes';
import { Question } from '@/types/models';

const Select = dynamic(() => import('react-select'), { ssr: false });

interface RenderQuestionContentProps {
  question: Question;
  products: DbProduct[];
  onAnswer: (value: string | string[]) => void;
  responses: { value: string; label: string }[];
  storeAnswer: (question: Question, answer: string | string[], products: DbProduct[]) => void;
  currentAnswer: string | string[] | undefined;
}

const RenderQuestionContent: React.FC<RenderQuestionContentProps> = ({ 
  question, 
  products,
  onAnswer,
  responses,
  storeAnswer,
  currentAnswer
}) => {
  const handleChange = (value: string | string[]) => {
    onAnswer(value);

    // Trouver les produits associés aux réponses
    const productIds = Array.isArray(value) 
      ? value.map(v => question.mapping?.[v]).filter(Boolean)
      : [question.mapping?.[value as string]].filter(Boolean);

    const associatedProducts = products.filter(p => productIds.includes(p.id));

    if (associatedProducts.length > 0) {
      storeAnswer(question, value, associatedProducts);
    }
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'YesNo':
        return (
          <div className='flex'>
            <div className="text-sm w-1/2 mb-4">{question.text}</div>
            <div className='w-1/2 pl-10'>
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
            <div className='flex'>
              <div className="text-sm w-1/2 mb-4">{question.text}</div>
              <div className='w-1/2 pl-10'>
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
        // Implémentez ici la logique pour le type DateRange
        return <p>DateRange non implémenté</p>;
      case 'FreeText':
        return (
          <div className='flex'>
            <div className="text-sm w-1/2 mb-4">{question.text}</div>
            <div className='w-1/2 pl-10'>
              <input 
                type="text" 
                value={currentAnswer as string || ''}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Entrez votre réponse"
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
      <div className="flex w-2/3 h-full justify-center items-center">
        <div className="w-full pl-10">
          {renderQuestionInput()}
        </div>
      </div>
    </div>
  );
};

export default RenderQuestionContent;