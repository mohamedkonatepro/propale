import { DefaultDescription, DefaultParagraph } from '@/types/models';

// Fetch default description by company ID
export const fetchDefaultDescription = async (companyId: string): Promise<DefaultDescription | null> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/default-description/${companyId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Error fetching default description');
  }

  return await response.json();
};

// Create or update default description
export const saveDefaultDescription = async (companyId: string, description: string, name: string): Promise<DefaultDescription | null> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/default-description/${companyId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ description, name }),
  });

  if (!response.ok) {
    throw new Error('Error saving default description');
  }

  return await response.json();
};

// Delete default description
export const deleteDefaultDescription = async (companyId: string): Promise<boolean> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/default-description/${companyId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Error deleting default description');
  }

  return true;
};

// Fetch default paragraph by company ID
export const fetchDefaultParagraph = async (companyId: string): Promise<DefaultParagraph[] | null> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/default-paragraph/${companyId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Error fetching default paragraph');
  }

  return await response.json();
};

// Create or update default paragraph
export const saveDefaultParagraph = async (companyId: string, name: string, description: string): Promise<DefaultParagraph | null> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/default-paragraph/${companyId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) {
    throw new Error('Error saving default paragraph');
  }

  return await response.json();
};

// Delete default paragraph
export const deleteDefaultParagraph = async (companyId: string, paragraphId: string): Promise<boolean> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/default-paragraph/${companyId}?paragraphId=${paragraphId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Error deleting default paragraph');
  }

  return true;
};
