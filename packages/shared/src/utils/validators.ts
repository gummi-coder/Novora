export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  // Basic phone number validation (can be customized based on requirements)
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

export const isValidNumber = (value: string): boolean => {
  return !isNaN(Number(value)) && isFinite(Number(value));
};

export const isValidLength = (value: string, min: number, max: number): boolean => {
  return value.length >= min && value.length <= max;
};

export const isValidAlphaNumeric = (value: string): boolean => {
  const alphaNumericRegex = /^[a-zA-Z0-9]+$/;
  return alphaNumericRegex.test(value);
}; 