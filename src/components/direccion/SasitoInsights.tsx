import React from "react";

interface SasitoInsightsProps {
  insights: string[];
}

export const SasitoInsights: React.FC<SasitoInsightsProps> = ({ insights }) => {
  return (
    <section className="rounded-[2rem] border border-blue-300/20 bg-blue-500/10 p-4 md:p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl border border-blue-200/20 bg-blue-400/10 text-blue-100">
          <span className="material-icons">auto_awesome</span>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-200">Sasito</p>
          <h3 className="text-lg font-black text-white">Insights de Dirección</h3>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {insights.map((insight) => (
          <div key={insight} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-sm text-blue-50">
            {insight}
          </div>
        ))}
      </div>
    </section>
  );
};

export default SasitoInsights;
