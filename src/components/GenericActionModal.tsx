import React, { useState } from "react";
import { toast } from "react-hot-toast";

export interface Field {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "select" | "file";
  options?: string[]; // For select or autocomplete
  required?: boolean;
}

interface GenericActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: Field[];
  onSubmit: (data: any) => Promise<void>;
  submitLabel?: string;
}

export const GenericActionModal = ({
  isOpen,
  onClose,
  title,
  description,
  fields,
  onSubmit,
  submitLabel = "Guardar",
}: GenericActionModalProps) => {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      toast.success("Acción registrada correctamente");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar acción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in relative">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative animate-scale-in">
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase italic">
              {title}
            </h2>
            {description && (
              <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title="Cerrar modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">
                {field.label} {field.required && "*"}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  required={field.required}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                  rows={3}
                  placeholder="Escriba los detalles aquí..."
                  title="Detalles de la acción"
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              ) : field.type === "select" ? (
                <select
                  required={field.required}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 appearance-none"
                  title="Seleccionar opción"
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Seleccione...
                  </option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === "file" ? (
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer group">
                  <span className="material-symbols-outlined text-3xl mb-2 group-hover:text-blue-500 transition-colors">
                    cloud_upload
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                    Subir Archivo o Evidencia
                  </span>
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    title="Seleccionar archivo o evidencia"
                    onChange={(e) =>
                      handleChange(field.name, e.target.files?.[0])
                    }
                  />
                  {formData[field.name] && (
                    <p className="text-xs text-blue-600 mt-2 font-bold z-20 bg-blue-50 px-2 py-1 rounded">
                      {formData[field.name].name}
                    </p>
                  )}
                </div>
              ) : (
                <input
                  type={field.type}
                  required={field.required}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                  placeholder={field.label}
                  title={field.label}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <span className="material-symbols-outlined animate-spin text-[18px]">
                  progress_activity
                </span>
              )}
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
