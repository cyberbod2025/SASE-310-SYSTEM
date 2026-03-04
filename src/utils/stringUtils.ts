export const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const cleanCURP = (curp: string): string => {
  return curp.toUpperCase().replace(/\s/g, "").substring(0, 18);
};
