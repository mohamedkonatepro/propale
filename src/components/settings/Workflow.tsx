import React from 'react';
import ProductList from './ProductList';
import QuestionList from './QuestionList';
import { Workflow as IWorkflow } from '@/types/models';

interface WorkflowProps {
  workflow: IWorkflow;
  updateWorkflow: (workflow: IWorkflow) => void;
  errors: Record<string, string>;
}

const Workflow: React.FC<WorkflowProps> = ({ workflow, updateWorkflow, errors = {} }) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateWorkflow({ ...workflow, name: e.target.value });
  };

  return (
    <div className="mt-2 bg-white p-7 rounded-3xl">
      <div className="mb-4">
        <label className="block text-sm font-medium text-labelGray">Nom du workflow</label>
        <input
          value={workflow.name}
          onChange={handleNameChange}
          className={`mt-1 w-full rounded p-2 bg-backgroundGray ${errors[`workflow.name`] ? 'border-red-500 border-2' : ''}`}
          type="text"
        />
        {errors['workflow.name'] && <span className="text-red-500">{errors['workflow.name']}</span>}
      </div>
      <ProductList 
        products={workflow.products} 
        updateProducts={(products) => updateWorkflow({ ...workflow, products })}
        errors={errors}
      />
      <QuestionList 
        questions={workflow.questions} 
        products={workflow.products}
        updateQuestions={(questions) => updateWorkflow({ ...workflow, questions })}
        errors={errors}
      />
    </div>
  );
};

export default Workflow;