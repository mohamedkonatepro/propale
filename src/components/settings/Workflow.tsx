import React from 'react';
import ProductList from './ProductList';
import QuestionList from './QuestionList';
import { Workflow as IWorkflow } from '@/types/models';

interface WorkflowProps {
  workflow: IWorkflow;
  updateWorkflow: (workflow: IWorkflow) => void;
}

const Workflow: React.FC<WorkflowProps> = ({ workflow, updateWorkflow }) => {
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
          className="mt-1 w-full rounded p-2 bg-backgroundGray"
          type="text"
        />
      </div>
      <ProductList 
        products={workflow.products} 
        updateProducts={(products) => updateWorkflow({ ...workflow, products })}
      />
      <QuestionList 
        questions={workflow.questions} 
        products={workflow.products}
        updateQuestions={(questions) => updateWorkflow({ ...workflow, questions })}
      />
    </div>
  );
};

export default Workflow;