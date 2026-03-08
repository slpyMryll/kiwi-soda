export const VSU_DOMAIN = "@vsu.edu.ph";

export const validateVsuEmail = (email: string): boolean => {
  return email.toLowerCase().endsWith(VSU_DOMAIN);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};