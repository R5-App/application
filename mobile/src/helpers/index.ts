// Helper functions
export const isEmpty = (value: any): boolean => {
  return value === null || value === undefined || value === '';
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fi-FI');
};

// Made some changes here so that the functiopn accepts date objects and date strings
/**
 * Calculate age in years from a birth date
 * @param {Date | string} dateOfBirth - Birth date as Date object or ISO string (YYYY-MM-DD)
 * @returns {number} Age in years
 */

export const calculateAge = (dateOfBirth: Date | string): number => {
  // Convert string to Date (if needed)
  const birthDate = typeof dateOfBirth === 'string' 
    ? new Date(dateOfBirth) 
    : dateOfBirth;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};


// Old:
/*
export const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
};
*/