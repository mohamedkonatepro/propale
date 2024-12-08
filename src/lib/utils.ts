import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn =(...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: Date) => {
  if (!(date instanceof Date)) {
    const dateFormated = new Date(date);
    const day = String(dateFormated.getUTCDate()).padStart(2, '0');
    const month = String(dateFormated.getUTCMonth() + 1).padStart(2, '0');
    const year = dateFormated.getUTCFullYear();
  
    return `${day}/${month}/${year}`;
  }
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const getInitials = (firstname: string, lastname: string) => {
  return `${firstname[0]}${lastname[0]}`.toUpperCase();
};

export const getOption = (value: any, options: any) => options.find((option: any) => option.value === value);


export const formatAmount = (amount: number | string): string => {
  let numericAmount = parseFloat(amount as string); // Conversion au cas où ce serait une chaîne

  if (isNaN(numericAmount)) {
    console.error('Invalid amount value:', amount);
    return '0.00'; // Retourner une valeur par défaut
  }

  // Arrondir à deux décimales
  const amountString = numericAmount.toFixed(2);

  // Séparer la partie entière et la partie décimale
  const [integerPart, decimalPart] = amountString.split(".");

  // Formatage avec espace comme séparateur de milliers
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  // Retourner le montant formaté
  return `${formattedIntegerPart}.${decimalPart}`;
}

export function truncateString(str: string | undefined, maxLength: number): string {
  if (!str) return ''; // Handle undefined or empty strings
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}