import { useEffect, useState } from "react"
import { GlassCard } from "../ui/GlassCard"
import { NeoButton } from "../ui/NeoButton"
import { getDiagnosticoPorGrupo, getDiagnosticoResumen } from "../../services/diagnosticoService"
import { DIAGNOSTICO_URL } from "../../config/modules"
import type { DiagnosticoTrends } from "../../services/diagnosticoService"

interface Props {
  grupo?: string
  alumnoId?: string
  canViewSensitive?: boolean
}

function TrendBar({ label, data }: { label: string; data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0)
  const colors: Record<string, string> = {
    bueno: "bg-green-500",
    regular: "bg-yellow-500",
    malo: "bg-red-500",
    excelente: "bg-emerald-500",
    insuficiente: "bg-orange-500",
  }

  return (
    <div className="mt-2">
      <div className="mb-1 text-xs font-medium text-slate-400">{label}</div>
      <div className="flex h-3 overflow-hidden rounded-full bg-white/5">
        {Object.entries(data).map(([k, v]) => (
          <div
            key={k}
            className={`${colors[k.toLowerCase()] ?? "bg-slate-500"} transition-all`}
            style={{ width: total > 0 ? `${(v / total) * 100}%` : "0%" }}
            title={`${k}: ${v}`}
          />
        ))}
      </div>
      <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-500">
        {Object.entries(data).map(([k, v]) => (
          <span key={k}>
            {k}: {v}
          </span>
        ))}
      </div>
    </div>
  )
}

export function TeacherDiagnosisOverview({ grupo, alumnoId, canViewSensitive = false }: Props) {
  const [loading, setLoading] = useState(true)
  const [trends, setTrends] = useState<DiagnosticoTrends | null>(null)
  const [completados, setCompletados] = useState(0)
  const [pendientes, setPendientes] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        if (alumnoId) {
          const resumen = await getDiagnosticoResumen(alumnoId)
          setTrends(resumen.trends)
          setCompletados(resumen.total)
          setPendientes(0)
        } else if (grupo) {
          const data = await getDiagnosticoPorGrupo(grupo)
          setTrends(data.tendencias)
          setCompletados(data.completados)
          setPendientes(data.pendientes)
        }
      } catch (err) {
        console.error("Error cargando diagnósticos:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [grupo, alumnoId])

  if (loading) {
    return (
      <GlassCard className="border border-white/5 bg-slate-950/55 p-4">
        <div className="text-sm text-slate-400">Cargando diagnósticos...</div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="border border-white/5 bg-slate-950/55 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Diagnóstico Docente</h3>
        <NeoButton
          onClick={() => window.open(DIAGNOSTICO_URL, "_blank")}
          className="bg-violet-500/20 text-xs text-white"
        >
          Ir a Diagnóstico
        </NeoButton>
      </div>

      {grupo && (
        <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-black/30 p-2 text-center">
            <div className="text-lg font-bold text-green-400">{completados}</div>
            <div className="text-slate-400">Completados</div>
          </div>
          <div className="rounded-lg bg-black/30 p-2 text-center">
            <div className="text-lg font-bold text-yellow-400">{pendientes}</div>
            <div className="text-slate-400">Pendientes</div>
          </div>
        </div>
      )}

      {trends && (
        <div className="space-y-3">
          <TrendBar label="Conducta" data={trends.conducta} />
          <TrendBar label="Aprovechamiento" data={trends.aprovechamiento} />
          <TrendBar label="Asistencia" data={trends.asistencia} />
        </div>
      )}

      {!trends || Object.keys(trends.conducta).length === 0 ? (
        <div className="mt-2 rounded-lg border border-dashed border-white/10 p-3 text-center text-xs text-slate-500">
          Sin datos de diagnóstico aún
        </div>
      ) : null}
    </GlassCard>
  )
}
