export interface DbWorkflow {
  id: string;
  company_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DbProduct {
  id: string;
  workflow_id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DbQuestion {
  id: string;
  workflow_id: string;
  text: string;
  type: 'YesNo' | 'Dropdown' | 'DateRange' | 'FreeText';
  mapping?: { [key: string]: string };
  created_at: string;
  updated_at: string;
}

export interface QuestionProductMapping {
  id: string;
  question_id: string;
  product_id: string;
  response_key: string;
  created_at: string;
  updated_at: string;
}

export interface DropdownValue {
  id: string;
  question_id: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface DbCompanySettings {
  company_id: string;
  workflows_allowed: number;
  users_allowed: number;
  contacts_per_prospect: number;
  folders_allowed: number;
  vision_canevas: boolean;
  vision_audit: boolean;
  composition_workflow: boolean;
  license_type: 'individual' | 'enterprise';
  is_account_disabled: boolean;
  workflow: DbWorkflow & {
    products: DbProduct[];
    questions: DbQuestion[];
  };
  questionProductMappings: QuestionProductMapping[];
  dropdownValues: DropdownValue[];
}

export interface StepperSession {
  id: string;
  company_id: string;
  workflow_id: string;
  profile_id: string;
  prospect_id: string;
  workflow_name: string;
  status: 'in_progress' | 'completed' | 'saved';
  current_step_name?: string;
  current_question_id?: string;
  created_at: string;
  updated_at: string;
}

export interface StepperResponse {
  id: string;
  session_id: string;
  question_id: string;
  question_text: string;
  product_id?: string;
  product_name: string;
  product_price: number;
  product_quantity: number;
  product_description?: string;
  answer?: string;
  is_validated: boolean;
  created_at: string;
  updated_at: string;
}
