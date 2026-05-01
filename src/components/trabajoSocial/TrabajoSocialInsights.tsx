import React from "react";
import {
  CitatorioRecord,
  ComplianceAgreement,
  FamilyContactRecord,
  hasThreeUnansweredCitatorios,
  TrabajoSocialCase,
} from "./trabajoSocialTypes";

interface TrabajoSocialInsightsProps {
  cases: TrabajoSocialCase[];
  citatorios: CitatorioRecord[];
  contacts: FamilyContactRecord[];
  agreements: ComplianceAgreement[];
  sasitoOpen: boolean;
}

const daysSince = (isoDate: string | null) => {
  if (!isoDate) return 99;
  const time = new Date(isoDate).getTime();
  if (Number.isNaN(time)) return 99;
  return Math.floor((Date.now() - time) / (24 * 60 * 60 * 1000));
};

export const TrabajoSocialInsights: React.FC<TrabajoSocialInsightsProps> = ({ cases, citatorios, contacts, agreements, sasitoOpen }) => {
  const noResponseCases = cases.filter((caseItem) => hasThreeUnansweredCitatorios(caseItem.id, citatorios));
  const staleCases = cases.filter((caseItem) => daysSince(caseItem.ultimaActividad) >= 15);
  const withoutContact = cases.filter((caseItem) => !contacts.some((contact) => contact.caseId === caseItem.id));
  const brokenAgreements = agreements.filter((agreement) => agreement.estado === "incumplido");

  const insights = [
    ...noResponseCases.map((caseItem) => `Padres no han respondido a 3 citatorios: ${caseItem.alumno}.`),
    ...staleCases.map((caseItem) => `Alumno sin seguimiento activo en 15 dias: ${caseItem.alumno}.`),
    ...withoutContact.slice(0, 2).map((caseItem) => `Falta primer contacto familiar: ${caseItem.alumno}.`),
    brokenAgreements.length > 0 ? `${brokenAgreements.length} acuerdos aparecen como incumplidos.` : "",
  ].filter(Boolean);

  return (
    <section className="rounded-[2rem] border border-orange-300/20 bg-orange-500/10 p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-orange-100">Insights</p>
          <h2 className="text-xl font-black text-white">Sasito operativo</h2>
        </div>
        <span className="rounded-full bg-slate-950/50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-100">
          {sasitoOpen ? "Abierto" : "Resumen"}
        </span>
      </div>

      <div className="space-y-3">
        {insights.length === 0 && <p className="rounded-3xl border border-white/10 bg-slate-950/35 p-4 text-sm font-semibold text-slate-300">Sin alertas criticas. Mantener bitacora de contactos al dia.</p>}
        {insights.map((insight) => (
          <div key={insight} className="rounded-3xl border border-white/10 bg-slate-950/45 p-4 text-sm font-bold leading-6 text-orange-50">
            {insight}
          </div>
        ))}
      </div>

      {sasitoOpen && (
        <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/60 p-4 text-sm leading-6 text-slate-300">
          Prioridad recomendada: atiende primero casos con tres citatorios sin respuesta, registra llamada o visita, y deja evidencia antes de devolver a Orientacion o escalar a Direccion.
        </div>
      )}
    </section>
  );
};
