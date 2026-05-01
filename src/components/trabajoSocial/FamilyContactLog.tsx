import React, { useState } from "react";
import { ContactType, FamilyContactRecord, TrabajoSocialCase } from "./trabajoSocialTypes";

interface FamilyContactLogProps {
  selectedCase: TrabajoSocialCase | null;
  contacts: FamilyContactRecord[];
  canEdit: boolean;
  onRegisterContact: (caseId: string, tipo: ContactType, resultado: string) => void;
}

const contactLabels: Record<ContactType, string> = {
  llamada: "Llamada",
  mensaje: "Mensaje",
  reunion: "Reunion",
};

export const FamilyContactLog: React.FC<FamilyContactLogProps> = ({
  selectedCase,
  contacts,
  canEdit,
  onRegisterContact,
}) => {
  const [result, setResult] = useState("");
  const caseContacts = selectedCase ? contacts.filter((contact) => contact.caseId === selectedCase.id) : [];

  const register = (tipo: ContactType) => {
    if (!selectedCase || !canEdit) return;
    onRegisterContact(selectedCase.id, tipo, result);
    setResult("");
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 md:p-5">
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-orange-200">Contacto familiar</p>
        <h2 className="text-xl font-black text-white">Llamadas, mensajes y reuniones</h2>
      </div>

      <textarea
        value={result}
        onChange={(event) => setResult(event.target.value)}
        placeholder="Resultado breve del contacto"
        className="min-h-[92px] w-full rounded-3xl border border-white/10 bg-slate-950/60 p-4 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-orange-300/50"
      />

      <div className="mt-3 grid grid-cols-3 gap-2">
        {(["llamada", "mensaje", "reunion"] as ContactType[]).map((tipo) => (
          <button key={tipo} type="button" disabled={!selectedCase || !canEdit} onClick={() => register(tipo)} className="min-h-[48px] rounded-2xl border border-orange-300/30 bg-orange-500/10 px-2 text-[10px] font-black uppercase tracking-widest text-orange-100 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500">
            {contactLabels[tipo]}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {caseContacts.length === 0 && <p className="rounded-3xl border border-dashed border-white/10 p-5 text-center text-sm font-semibold text-slate-400">Sin contactos registrados para este caso.</p>}
        {caseContacts.map((contact) => (
          <article key={contact.id} className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-white">{contactLabels[contact.tipo]}</p>
              <span className="text-xs font-bold text-slate-500">{contact.fecha}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{contact.resultado}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
