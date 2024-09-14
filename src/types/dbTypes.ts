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