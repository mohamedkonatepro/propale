export interface Company {
  id: string;
  company_id?: string;
  prospect_id?: string;
  name: string;
  siret: string;
  siren?: string;
  ape_code?: string;
  activity_sector?: string;
  address?: string;
  city?: string;
  postalcode?: string;
  country?: string;
  created_at?: Date;
  updated_at?: Date;
  blocked?: boolean;
  description?: string;
  heat_level?: string;
  status?: string;
  type?: string;
}

export interface Profile {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  position: string;
  phone: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  role: string;
  blocked: boolean;
  is_primary_contact: boolean;
}

export type Contact = {
  email: string;
  firstname: string;
  lastname: string;
  position?: string;
  phone?: string;
  role?: string;
};

export type CompanyModalData = {
  id?: string;
  companyId?: string;
  name: string;
  siret: string;
  siren: string;
  ape_code?: string;
  activity_sector?: string;
  description?: string;
  address?: string;
  city?: string;
  postalcode?: string;
  country?: string;
  heat_level?: string;
  status?: string;
  type?: string;
  email: string;
  firstname?: string;
  lastname?: string;
  position?: string;
  phone?: string;
  role?: string;
  additionalContacts?: Contact[];
};

export type QuestionType = 'YesNo' | 'Dropdown' | 'DateRange' | 'FreeText';

export interface Product {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
}

export interface Workflow {
  id?: string;
  name: string;
  products?: Product[];
  questions?: Question[];
}

export interface CompanySettings {
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
  workflow?: Workflow;
}

export interface DropdownValue {
  id?: string;
  question_id: string;
  value: string;
}

export interface Question {
  id?: string;
  text: string;
  type: 'YesNo' | 'Dropdown' | 'DateRange' | 'FreeText';
  dropdownValues?: DropdownValue[];
  mapping?: {
    [key: string]: string;
  };
}

export interface NeedFormData {
  id?: string;
  name: string;
  quantity: string;
  price: string;
  description: string;
  showPrice: boolean;
  showName: boolean;
}

export interface Item {
  id: string;
  type: 'need' | 'paragraph' | 'header' | 'price' | 'description';
  name?: string;
  quantity?: number;
  price?: number;
  description?: string;
  showPrice?: boolean;
  showName?: boolean;
  content: string | React.ReactNode;
}

export interface Need {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  showName: boolean;
  showPrice: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Paragraph {
  id?: string;
  name: string;
  description: string;
  showName: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProposalData {
  companyId: string;
  companyName: string;
  companySiren: string;
  prospectId: string;
  prospectName: string;
  prospectSiren: string;
  createdBy: string;
  title: string;
  showTitle: boolean;
  description: string;
  totalPrice: number;
  needs: Need[];
  paragraphs: Paragraph[];
  status: ProposalStatus['status'];
  mention_realise: boolean;
}

export interface Proposal {
  id: string;
  company_id: string;
  company_name: string;
  company_siren: string;
  prospect_id: string;
  prospect_name: string;
  prospect_siren: string;
  created_by: string;
  status: ProposalStatus['status'];
  title: string;
  description: string;
  show_title: boolean;
  total_price: number;
  mention_realise: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProposalStatus {
  status: 'draft' | 'accepted' | 'refused' | 'proposed';
}
