export const getBorderClass = (isValid: boolean, value: string, isSubmitted: boolean) => {
  if (!isSubmitted && !value) {
    return "border-gray-300 focus:border-green-dark";
  }
  
  return isValid 
    ? "border-green-600 focus:border-green-600 shadow-[0_0_0_1px_rgba(22,101,52,0.1)]" 
    : "border-red-500 focus:border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]";
};