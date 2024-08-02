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
  createdAt?: Date;
  updatedAt?: Date;
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
  heatLevel?: string;
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
