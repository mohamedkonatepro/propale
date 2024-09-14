import React from 'react';
import { FaRegTrashAlt, FaPlus } from 'react-icons/fa';
import Select from 'react-select';
import QuestionMapping from './QuestionMapping';
import { Product, Question } from '@/types/models';

interface QuestionListProps {
  questions: Question[];
  products: Product[];
  updateQuestions: (questions: Question[]) => void;
}

const responseTypeOptions = [
  { value: 'YesNo', label: 'Oui/Non' },
  { value: 'Dropdown', label: 'Liste déroulante' },
  { value: 'DateRange', label: 'Date Début & Date Fin' },
  { value: 'FreeText', label: 'Texte libre' }
];

const QuestionList: React.FC<QuestionListProps> = ({ questions, products, updateQuestions }) => {
  const addQuestion = () => {
    updateQuestions([...questions, { text: '', type: 'YesNo' }]);
  };

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const updatedQuestions = questions.map((question, i) => 
      i === index ? updatedQuestion : question
    );
    updateQuestions(updatedQuestions);
  };

  const deleteQuestion = (index: number) => {
    updateQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-labelGray mb-2">Questions</h4>
      {questions.map((question, index) => (
        <div key={index} className="mb-4">
          <div className="flex items-center mb-2">
            <input
              value={question.text}
              onChange={(e) => updateQuestion(index, { ...question, text: e.target.value })}
              placeholder="Question"
              className="mr-2 rounded p-2 bg-backgroundGray flex-grow"
              type="text"
            />
            <Select
              options={responseTypeOptions}
              value={responseTypeOptions.find(option => option.value === question.type)}
              onChange={(selectedOption: any) => {
                if (selectedOption) {
                  updateQuestion(index, { ...question, type: selectedOption.value });
                }
              }}
              className="w-48 mr-2"
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
          <QuestionMapping 
            question={question} 
            products={products}
            updateQuestion={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
          />
        </div>
      ))}
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