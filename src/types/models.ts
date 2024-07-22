export interface Company {
  id: string;
  company_id: string;
  prospect_id: string;
  name: string;
  siret: string;
  siren: string;
  activity_sector: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
  blocked: boolean;
  description: string;
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
}
