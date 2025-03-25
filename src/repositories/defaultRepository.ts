import { supabase } from '@/lib/supabaseClient';
import { DefaultDescription, DefaultParagraph } from '@/types/models';

export class DefaultRepository {
  
  // Default Descriptions
  static async findDefaultDescriptionByCompanyId(companyId: string): Promise<DefaultDescription | null> {
    const { data, error } = await supabase
      .from('default_descriptions')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Error fetching default description: ${error.message}`);
    }

    return data;
  }

  static async createDefaultDescription(companyId: string, name: string, description: string): Promise<DefaultDescription> {
    const { data, error } = await supabase
      .from('default_descriptions')
      .insert([{
        company_id: companyId,
        name,
        description,
      }])
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error creating default description: ${error.message}`);
    }

    return data;
  }

  static async updateDefaultDescription(companyId: string, name: string, description: string): Promise<DefaultDescription> {
    const { data, error } = await supabase
      .from('default_descriptions')
      .update({
        name,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('company_id', companyId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error updating default description: ${error.message}`);
    }

    return data;
  }

  static async upsertDefaultDescription(companyId: string, name: string, description: string): Promise<DefaultDescription> {
    const existing = await this.findDefaultDescriptionByCompanyId(companyId);
    
    if (existing) {
      return await this.updateDefaultDescription(companyId, name, description);
    } else {
      return await this.createDefaultDescription(companyId, name, description);
    }
  }

  static async deleteDefaultDescription(companyId: string): Promise<void> {
    const { error } = await supabase
      .from('default_descriptions')
      .delete()
      .eq('company_id', companyId);

    if (error) {
      throw new Error(`Error deleting default description: ${error.message}`);
    }
  }

  // Default Paragraphs
  static async findDefaultParagraphsByCompanyId(companyId: string): Promise<DefaultParagraph[]> {
    const { data, error } = await supabase
      .from('default_paragraphs')
      .select('*')
      .eq('company_id', companyId);

    if (error) {
      throw new Error(`Error fetching default paragraphs: ${error.message}`);
    }

    return data || [];
  }

  static async createDefaultParagraph(companyId: string, name: string, description: string): Promise<DefaultParagraph> {
    const { data, error } = await supabase
      .from('default_paragraphs')
      .insert([{
        company_id: companyId,
        name,
        description,
      }])
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error creating default paragraph: ${error.message}`);
    }

    return data;
  }

  static async updateDefaultParagraph(id: string, name: string, description: string): Promise<DefaultParagraph> {
    const { data, error } = await supabase
      .from('default_paragraphs')
      .update({
        name,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error updating default paragraph: ${error.message}`);
    }

    return data;
  }

  static async deleteDefaultParagraph(id: string): Promise<void> {
    const { error } = await supabase
      .from('default_paragraphs')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting default paragraph: ${error.message}`);
    }
  }
}