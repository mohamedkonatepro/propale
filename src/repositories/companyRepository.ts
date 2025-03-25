import { supabase } from '@/lib/supabaseClient';
import { Company } from '@/types/models';
import { handleDatabaseError, NotFoundError } from '@/utils/errors';

export class CompanyRepository {
  
  // Méthodes de lecture
  static async findById(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('company')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      handleDatabaseError(error, 'Company/findById');
    }

    return data;
  }

  static async findAllWithoutParent(search?: string): Promise<Company[]> {
    let query = supabase
      .from('company')
      .select('*')
      .or('company_id.is.null,company_id.eq.""')
      .is('type', null);

    if (search) {
      query = query.or(`name.ilike.%${search}%,siren.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      handleDatabaseError(error, 'Company/findAllWithoutParent');
    }

    return data || [];
  }

  static async findByProfileId(profileId: string): Promise<Company[]> {
    const { data: companyProfileData, error: companyProfileError } = await supabase
      .from('companies_profiles')
      .select('company_id')
      .eq('profile_id', profileId);

    if (companyProfileError) {
      throw new Error(`Error fetching company-profile relations: ${companyProfileError.message}`);
    }

    if (!companyProfileData || companyProfileData.length === 0) {
      return [];
    }

    const companyIds = companyProfileData.map(({ company_id }) => company_id);
    
    const { data: companies, error: companiesError } = await supabase
      .from('company')
      .select('*')
      .in('id', companyIds);

    if (companiesError) {
      throw new Error(`Error fetching companies: ${companiesError.message}`);
    }

    return companies || [];
  }

  static async findWithParentByProfileId(profileId: string, search?: string): Promise<Company[]> {
    const companies = await this.findByProfileId(profileId);
    
    let filteredCompanies = companies.filter(company => 
      company.company_id && company.company_id !== '' && !company.type
    );

    if (search && search.length >= 3) {
      filteredCompanies = filteredCompanies.filter(company =>
        company.name.toLowerCase().includes(search.toLowerCase()) ||
        (company.siret && company.siret.includes(search))
      );
    }

    return filteredCompanies;
  }

  static async findWithoutParentByProfileId(profileId: string): Promise<Company | null> {
    const companies = await this.findByProfileId(profileId);

    // Trouve la compagnie racine (sans parent)
    for (const company of companies) {
      let currentCompany = company;
      
      // Remonte la hiérarchie jusqu'à la racine
      while (currentCompany.company_id) {
        const parent = await this.findById(currentCompany.company_id);
        if (!parent) break;
        currentCompany = parent;
      }

      // Si on arrive à une compagnie sans parent, c'est la racine
      if (!currentCompany.company_id) {
        return currentCompany;
      }
    }

    return null;
  }

  static async findByParentId(parentId: string, search?: string): Promise<Company[]> {
    let query = supabase
      .from('company')
      .select('*')
      .eq('company_id', parentId)
      .is('type', null);
    
    if (search && search.length >= 3) {
      query = query.or(`name.ilike.%${search}%,siret.ilike.%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      handleDatabaseError(error, 'Company/findByParentId');
    }
    
    return data || [];
  }

  static async findProspects(companyId: string, search?: string, page = 1, pageSize = 10): Promise<{data: Company[], count: number}> {
    let query = supabase
      .from('company')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .eq('type', 'prospect');

    if (search) {
      query = query.or(`name.ilike.%${search}%,siren.ilike.%${search}%`);
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error fetching prospects: ${error.message}`);
    }

    return {
      data: data || [],
      count: count || 0
    };
  }

  static async findByUserId(userId: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies_profiles')
      .select('company_id')
      .eq('profile_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      handleDatabaseError(error, 'Company/findByUserId');
    }

    return this.findById(data.company_id);
  }

  static async countByParentId(parentId: string): Promise<number> {
    const { count, error } = await supabase
      .from('company')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', parentId);

    if (error) {
      throw new Error(`Error counting companies: ${error.message}`);
    }

    return count || 0;
  }

  static async countProspectsByCompanyId(companyId: string): Promise<number> {
    const { count, error } = await supabase
      .from('company')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('type', 'prospect');

    if (error) {
      throw new Error(`Error counting prospects: ${error.message}`);
    }

    return count || 0;
  }

  static async countAllProspectsRecursively(companyId: string): Promise<number> {
    // Compte les prospects directs de cette company
    let totalCount = 0;
    
    const { count: directProspects, error: directError } = await supabase
      .from('company')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('type', 'prospect');
    
    if (directError) {
      throw new Error(`Error counting direct prospects: ${directError.message}`);
    }
    
    totalCount += directProspects || 0;
    
    // Trouve toutes les sous-companies (dossiers)
    const { data: subCompanies, error: subCompaniesError } = await supabase
      .from('company')
      .select('id')
      .eq('company_id', companyId)
      .is('type', null);
    
    if (subCompaniesError) {
      throw new Error(`Error fetching sub-companies: ${subCompaniesError.message}`);
    }
    
    // Compte récursivement les prospects dans chaque sous-company
    if (subCompanies && subCompanies.length > 0) {
      for (const subCompany of subCompanies) {
        const subCount = await this.countAllProspectsRecursively(subCompany.id);
        totalCount += subCount;
      }
    }
    
    return totalCount;
  }

  // Méthodes de validation
  static async checkSiretUnique(siret: string, excludeCompanyId?: string): Promise<boolean> {
    let query = supabase
      .from('company')
      .select('id')
      .eq('siret', siret);

    if (excludeCompanyId) {
      query = query.neq('id', excludeCompanyId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error checking SIRET: ${error.message}`);
    }

    return !data || data.length === 0;
  }

  static async checkSirenUnique(siren: string, excludeCompanyId?: string): Promise<boolean> {
    let query = supabase
      .from('company')
      .select('id')
      .eq('siren', siren);

    if (excludeCompanyId) {
      query = query.neq('id', excludeCompanyId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error checking SIREN: ${error.message}`);
    }

    return !data || data.length === 0;
  }

  // Méthodes de création/modification
  static async create(companyData: Partial<Company> & {company_id?: string | null}): Promise<Company> {
    const { data, error } = await supabase
      .from('company')
      .insert([{
        company_id: companyData.company_id || null,
        name: companyData.name,
        siret: companyData.siret || null,
        siren: companyData.siren,
        ape_code: companyData.ape_code,
        activity_sector: companyData.activity_sector,
        description: companyData.description || null,
        address: companyData.address,
        city: companyData.city,
        postalcode: companyData.postalcode,
        country: companyData.country,
        heat_level: companyData.heat_level,
        status: companyData.status,
        type: companyData.type,
      }])
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error creating company: ${error.message}`);
    }

    return data;
  }

  static async update(id: string, companyData: Partial<Company>): Promise<void> {
    const { error } = await supabase
      .from('company')
      .update({
        name: companyData.name,
        siret: companyData.siret || null,
        siren: companyData.siren,
        ape_code: companyData.ape_code,
        activity_sector: companyData.activity_sector,
        description: companyData.description || null,
        updated_at: new Date().toISOString(),
        address: companyData.address,
        city: companyData.city,
        postalcode: companyData.postalcode,
        country: companyData.country,
        heat_level: companyData.heat_level,
        status: companyData.status,
        type: companyData.type,
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Error updating company: ${error.message}`);
    }
  }

  static async updateStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('company')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Error updating company status: ${error.message}`);
    }
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('company')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting company: ${error.message}`);
    }
  }
}