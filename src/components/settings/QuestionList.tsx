import React from 'react';
import { FaRegTrashAlt, FaPlus } from 'react-icons/fa';
import Select from 'react-select';
import QuestionMapping from './QuestionMapping';
import { Product, Question, DropdownValue } from '@/types/models';

interface QuestionListProps {
  questions?: Question[];
  products?: Product[];
  updateQuestions: (questions: Question[]) => void;
  errors?: Record<string, string>;
}

const responseTypeOptions = [
  { value: 'YesNo', label: 'Oui/Non' },
  { value: 'Dropdown', label: 'Liste déroulante' },
  { value: 'DateRange', label: 'Date Début & Date Fin' },
  { value: 'FreeText', label: 'Texte libre' }
];

const QuestionList: React.FC<QuestionListProps> = ({ questions = [], products = [], updateQuestions, errors = {} }) => {
  const addQuestion = () => {
    const newQuestion: Question = { 
      text: '', 
      type: 'YesNo', 
      mapping: { Yes: '', No: '' },
      dropdownValues: []
    };
    updateQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const updatedQuestions = questions.map((question, i) => 
      i === index ? processQuestionUpdate(updatedQuestion) : question
    );
    updateQuestions(updatedQuestions);
  };

  const processQuestionUpdate = (question: Question): Question => {
    let newMapping = { ...question.mapping };
    let newDropdownValues = question.dropdownValues;

    if (question.type === 'Dropdown') {
      newMapping = processDropdownMapping(newMapping, newDropdownValues);
    } else {
      newMapping = cleanMapping(question);
      newDropdownValues = [];
    }

    return {
      ...question,
      mapping: newMapping,
      dropdownValues: newDropdownValues
    };
  };

  const processDropdownMapping = (mapping: { [key: string]: string }, dropdownValues: DropdownValue[] | undefined) => {
    const newMapping = dropdownValues?.reduce((acc, dv) => {
      if (mapping[dv.value]) {
        acc[dv.value] = mapping[dv.value];
      }
      return acc;
    }, {} as { [key: string]: string }) || {};

    dropdownValues?.forEach(dv => {
      if (!newMapping[dv.value]) {
        newMapping[dv.value] = '';
      }
    });

    return newMapping;
  };

  const cleanMapping = (question: Question): { [key: string]: string } => {
    switch (question.type) {
      case 'YesNo':
        return {
          Yes: question.mapping?.Yes || '',
          No: question.mapping?.No || ''
        };
      case 'Dropdown':
        return processDropdownMapping(question.mapping || {}, question.dropdownValues);
      case 'DateRange':
      case 'FreeText':
        return {
          default: question.mapping?.default || ''
        };
      default:
        return {};
    }
  };

  const deleteQuestion = (index: number) => {
    updateQuestions(questions.filter((_, i) => i !== index));
  };

  const handleTypeChange = (index: number, newType: Question['type']) => {
    const updatedQuestions = questions.map((question, i) => 
      i === index ? initializeQuestionType(question, newType) : question
    );
    updateQuestions(updatedQuestions);
  };

  const initializeQuestionType = (question: Question, newType: Question['type']): Question => {
    let newMapping: { [key: string]: string } = {};
    let newDropdownValues: DropdownValue[] = [];

    switch (newType) {
      case 'YesNo':
        newMapping = { Yes: '', No: '' };
        break;
      case 'Dropdown':
        newDropdownValues = [{ question_id: question.id || '', value: '' }];
        break;
      case 'DateRange':
      case 'FreeText':
        newMapping = { default: '' };
        break;
    }

    return {
      ...question,
      type: newType,
      mapping: newMapping,
      dropdownValues: newDropdownValues
    };
  };

  const hasMappingErrors = (questionId: string) => {
    return Object.keys(errors).some((key) => key.startsWith(`workflow.questions.${questionId}.mapping`));
  };

  const renderQuestion = (question: Question, index: number) => (
    <div key={index}>
      <div className="flex items-center mb-2">
        <input
          value={question.text}
          onChange={(e) => updateQuestion(index, { ...question, text: e.target.value })}
          placeholder="Question"
          className={`mr-2 rounded p-2 bg-backgroundGray flex-grow ${errors[`workflow.questions.${index}.text`] ? 'border-red-500 border-2' : ''}`}
          type="text"
        />
        
        <Select
          options={responseTypeOptions}
          value={responseTypeOptions.find(option => option.value === question.type)}
          onChange={(selectedOption: any) => {
            if (selectedOption) {
              handleTypeChange(index, selectedOption.value);
            }
          }}
          className={`w-48 mr-2 ${errors[`workflow.questions.${index}.type`] ? 'border-red-500 border-2' : ''}`}
          classNamePrefix="select"
        />
        <button
          type="button"
          onClick={() => deleteQuestion(index)}
          className="rounded px-2 py-1 ml-2"
        >
          <FaRegTrashAlt className="text-red-500" size={20} />
        </button>
      </div>
      <div>
       {errors[`workflow.questions.${index}.text`] && <div className="text-red-500">{errors[`workflow.questions.${index}.text`]}</div>}
      </div>
      <div>
        <QuestionMapping 
          question={question} 
          products={products}
          updateQuestion={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
        />
        {hasMappingErrors(index.toString()) && (
          <div className="text-red-500 mt-2">
            Veuillez lier toutes les réponses à un produit.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-labelGray mb-2">Questions</h4>
      {questions.map(renderQuestion)}
      <button
        type="button"
        onClick={addQuestion}
        className="mt-10 border border-blueCustom hover:bg-blue-100 text-blueCustom rounded-lg px-4 py-2 flex items-center"
      >
        <FaPlus size={20} /> <div className='ml-2'>Ajouter une question</div>
      </button>
    </div>
  );
};

export default QuestionList;
