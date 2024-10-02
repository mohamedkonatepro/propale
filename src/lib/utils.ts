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

export const formatAmount = (amount: number): string => {
  const amountString = amount.toFixed(2);

  const [integerPart, decimalPart] = amountString.split(".");

  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return `${formattedIntegerPart}.${decimalPart}`;
}