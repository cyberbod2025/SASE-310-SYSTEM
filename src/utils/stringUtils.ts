export const normalizeString = (str: string | null | undefined): string => {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const cleanCURP = (curp: string): string => {
  return curp.toUpperCase().replace(/\s/g, "").substring(0, 18);
};
