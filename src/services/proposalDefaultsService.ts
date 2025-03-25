import { DefaultDescription, DefaultParagraph } from '@/types/models';
import { DefaultRepository } from '@/repositories/defaultRepository';

// Fetch default description by company ID
export const fetchDefaultDescription = async (companyId: string): Promise<DefaultDescription | null> => {
  return await DefaultRepository.findDefaultDescriptionByCompanyId(companyId);
};

// Create or update default description
export const saveDefaultDescription = async (companyId: string, description: string, name: string): Promise<DefaultDescription> => {
  return await DefaultRepository.upsertDefaultDescription(companyId, name, description);
};

// Delete default description
export const deleteDefaultDescription = async (companyId: string): Promise<boolean> => {
  await DefaultRepository.deleteDefaultDescription(companyId);
  return true;
};

// Fetch default paragraph by company ID
export const fetchDefaultParagraph = async (companyId: string): Promise<DefaultParagraph[]> => {
  return await DefaultRepository.findDefaultParagraphsByCompanyId(companyId);
};

// Create or update default paragraph
export const saveDefaultParagraph = async (companyId: string, name: string, description: string): Promise<DefaultParagraph> => {
  return await DefaultRepository.createDefaultParagraph(companyId, name, description);
};

// Delete default paragraph
export const deleteDefaultParagraph = async (companyId: string, paragraphId: string): Promise<boolean> => {
  await DefaultRepository.deleteDefaultParagraph(paragraphId);
  return true;
};
