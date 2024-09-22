import React, { useEffect } from 'react';
import Select from 'react-select';
import { FaRegTrashAlt, FaPlus } from 'react-icons/fa';
import { DropdownValue, Product, Question } from '@/types/models';

interface QuestionMappingProps {
  question: Question;
  products?: Product[];
  updateQuestion: (updatedQuestion: Question) => void;
}

const QuestionMapping: React.FC<QuestionMappingProps> = ({ question, products = [], updateQuestion }) => {
  const productOptions = products?.map(product => ({ value: product.id, label: product.name }));

  const addDropdownValue = () => {
    const newDropdownValue: DropdownValue = { question_id: question.id || '', value: '' };
    updateQuestion({
      ...question,
      dropdownValues: [...(question.dropdownValues || []), newDropdownValue]
    });
  };

  const updateDropdownValue = (index: number, newValue: string) => {
    const updatedDropdownValues = question.dropdownValues?.map((dv, i) => 
      i === index ? { ...dv, value: newValue } : dv
    ) || [];

    const oldValue = question.dropdownValues?.[index].value;
    const newMapping = { ...question.mapping };
    
    if (oldValue && newMapping[oldValue]) {
      // Transférer la valeur mappée de l'ancienne clé à la nouvelle
      newMapping[newValue] = newMapping[oldValue];
      delete newMapping[oldValue];
    } else {
      // Si pas de mapping existant, initialiser avec une chaîne vide
      newMapping[newValue] = '';
    }

    updateQuestion({
      ...question,
      dropdownValues: updatedDropdownValues,
      mapping: newMapping
    });
  };

  const handleMappingChange = (key: string, value: string) => {
    updateQuestion({
      ...question,
      mapping: { ...(question.mapping || {}), [key]: value }
    });
  };

  const deleteDropdownValue = (index: number) => {
    updateQuestion({
      ...question,
      dropdownValues: question.dropdownValues?.filter((_, i) => i !== index) || []
    });
  };

  switch (question.type) {
    case 'YesNo':
      return (
        <>
          <div className="flex items-center mb-2">
            <span className="mr-2">Oui:</span>
            <Select
              options={productOptions}
              value={question.mapping?.['Yes'] ? productOptions.find(option => option.value === question.mapping?.['Yes']) : null}
              onChange={(selectedOption: any) => handleMappingChange('Yes', selectedOption?.value)}
              className="w-64"
            />
          </div>
          <div className="flex items-center mb-2">
            <span className="mr-2">Non:</span>
            <Select
              options={productOptions}
              value={question.mapping?.['No'] ? productOptions.find(option => option.value === question.mapping?.['No']) : null}
              onChange={(selectedOption: any) => handleMappingChange('No', selectedOption?.value)}
              className="w-64"
            />
          </div>
        </>
      );
      case 'Dropdown':
        return (
          <div className="mt-2">
            <p className="text-sm font-medium mb-2">Valeurs de la liste déroulante :</p>
            {question.dropdownValues?.map((dropdownValue, valueIndex) => (
              <div key={valueIndex} className="flex items-center mb-2">
                <input
                  type="text"
                  value={dropdownValue.value}
                  onChange={(e) => updateDropdownValue(valueIndex, e.target.value)}
                  className="mr-2 rounded p-2 bg-backgroundGray flex-grow"
                  placeholder={`Valeur ${valueIndex + 1}`}
                />
                <Select
                  options={productOptions}
                  value={question.mapping?.[dropdownValue.value] ? productOptions.find(option => option.value === question.mapping?.[dropdownValue.value]) : null}
                  onChange={(selectedOption: any) => handleMappingChange(dropdownValue.value, selectedOption?.value)}
                  className="w-64"
                />
                <button
                  type="button"
                  onClick={() => deleteDropdownValue(valueIndex)}
                  className="rounded px-2 py-1"
                >
                  <FaRegTrashAlt className="text-red-500" size={20} />
                </button>
              </div>
            ))}
          {(question.dropdownValues?.length || 0) < 10 && (
            <button
              type="button"
              onClick={addDropdownValue}
              className="mt-2 bg-blueCustom text-white rounded px-4 py-2 flex items-center"
            >
              <FaPlus size={20} /> <div className='ml-2'>Ajouter une valeur</div>
            </button>
          )}
        </div>
      );
    case 'DateRange':
    case 'FreeText':
      return (
        <div className="flex items-center mb-2">
          <span className="mr-2">Produit associé:</span>
          <Select
            options={productOptions}
            value={question.mapping?.default ? productOptions.find(option => option.value === question.mapping?.default) : null}
            onChange={(selectedOption: any) => handleMappingChange('default', selectedOption?.value)}
            className="w-64"
          />
        </div>
      );
    default:
      return null;
  }
};

export default QuestionMapping;