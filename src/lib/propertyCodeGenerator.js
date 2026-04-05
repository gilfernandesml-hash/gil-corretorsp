export const generatePropertyCode = () => {
  const timePart = Date.now().toString(36).toUpperCase();
  const randPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `IMV-${timePart}-${randPart}`;
};
