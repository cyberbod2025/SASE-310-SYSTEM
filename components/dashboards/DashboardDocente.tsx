export const DashboardDocente = () => {
  const [activeTab, setActiveTab] = useState<
    "PANEL" | "ASISTENCIA" | "CALIFICACIONES"
  >("PANEL");
  const { students, isTutorMode, toggleTutorMode, setCurrentModule } = useApp();

  const handleQuickAction = (action: string) => {
    if (action === "incidencia") {
      useApp().setQuickRegisterOpen(true);
    } else if (action === "lista" || action === "imprimir") {
      setCurrentModule(AppModule.REPORTES);
    } else if (action === "planeacion" || action === "calendario") {
      setCurrentModule(AppModule.AGENDA);
    }
  };

  const riskCount = students.filter((s) => s.incidents.length >= 3).length;
  const warningCount = students.filter(
    (s) => s.incidents.length > 0 && s.incidents.length < 3
  ).length;

  const alerts = students.filter(
    (s) =>
      s.incidents.length > 0 || (s.medicalAlerts && s.medicalAlerts.length > 0)
  );

  return (
    <div className="flex-1 w-full space-y-8 animate-fade-in relative z-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <img
              src="/assets/branding/DOCENTES.png"
              alt="Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Control Escolar del Grupo
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
                3º Grado :: Grupo B
              </span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                Ciclo Escolar 2025-2026
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleQuickAction("incidencia")}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">
              add_circle
            </span>
            Registrar Incidencia
          </button>
          <button
            onClick={toggleTutorMode}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
              isTutorMode
                ? "bg-slate-800 border-slate-800 text-white shadow-lg shadow-slate-200"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {isTutorMode ? "Modo Tutor Activo" : "Vista Estándar"}
          </button>
        </div>
      </div>

      {/* Institutional Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 text-amber-900 shadow-sm">
        <div className="size-10 bg-amber-100 rounded-full flex items-center justify-center border border-amber-200 shrink-0">
          <span className="material-symbols-outlined">info</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">Aviso del Sistema</p>
          <p className="text-xs font-medium opacity-80">
            Faltan 3 días para el cierre de la captura de evaluaciones del
            segundo periodo trimestral.
          </p>
        </div>
        <button className="text-xs font-bold border-b border-amber-900/30 hover:border-amber-900 transition-all pb-0.5">
          Ver Cronograma
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-200/50 rounded-xl w-fit">
        {[
          { id: "PANEL", label: "Vista General", icon: "grid_view" },
          { id: "ASISTENCIA", label: "Asistencia", icon: "fact_check" },
          { id: "CALIFICACIONES", label: "Evaluaciones", icon: "assignment" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "PANEL" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
          {/* Main Stats */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                label="Riesgo Crítico"
                value={riskCount}
                color="red"
                icon="warning"
              />
              <StatCard
                label="En Seguimiento"
                value={warningCount}
                color="amber"
                icon="visibility"
              />
              <StatCard
                label="Asistencia Promedio"
                value="94%"
                color="blue"
                icon="trending_up"
              />
            </div>

            {/* Student List Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">
                    group
                  </span>
                  Listado de Alumnos
                </h3>
                <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden p-0.5">
                  <button className="p-1.5 text-blue-600 bg-blue-50 rounded">
                    <span className="material-symbols-outlined text-[18px]">
                      grid_view
                    </span>
                  </button>
                  <button className="p-1.5 text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">
                      view_list
                    </span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students.map((s) => (
                  <StudentCard key={s.id} student={s} />
                ))}
              </div>
            </div>
          </div>

          {/* Side Actions & Alerts */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Accesos Directos
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <QuickButton
                  icon="edit_note"
                  label="Reportar"
                  onClick={() => handleQuickAction("incidencia")}
                  color="blue"
                />
                <QuickButton
                  icon="fact_check"
                  label="Asistencia"
                  onClick={() => setActiveTab("ASISTENCIA")}
                  color="green"
                />
                <QuickButton
                  icon="print"
                  label="Imprimir"
                  onClick={() => handleQuickAction("imprimir")}
                  color="purple"
                />
                <QuickButton
                  icon="sticky_note_2"
                  label="Notas"
                  onClick={() => handleQuickAction("calendario")}
                  color="amber"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[400px]">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-[10px] font-bold text-red-700 uppercase tracking-widest">
                  Notificaciones del Grupo
                </h3>
                <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100">
                  {alerts.length} alertas
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {alerts.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-300 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">
                        ALERTA
                      </span>
                      <span className="text-[9px] text-slate-400">
                        Hace 15 min
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">{s.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                      {s.incidents[0]?.description || "Requiere seguimiento."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {(activeTab === "ASISTENCIA" || activeTab === "CALIFICACIONES") && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center shadow-sm">
          <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 mb-4">
            <span className="material-symbols-outlined text-slate-400 text-3xl">
              pending
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">
            Módulo en Revisión Especial
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            Estamos optimizando la interfaz de seguimiento oficial para cumplir
            con los estándares de identidad pública.
          </p>
          <button
            onClick={() => setActiveTab("PANEL")}
            className="px-6 py-2 bg-slate-800 text-white font-bold text-sm rounded-lg hover:bg-slate-900 transition-all"
          >
            Volver al Panel Principal
          </button>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color, icon }: any) => {
  const colors: any = {
    red: "text-red-600 bg-red-50 border-red-100 shadow-red-50",
    amber: "text-amber-600 bg-amber-50 border-amber-100 shadow-amber-50",
    blue: "text-blue-600 bg-blue-50 border-blue-100 shadow-blue-50",
  };
  return (
    <div
      className={`p-5 rounded-2xl bg-white border border-slate-200 shadow-sm ${colors[color]} relative group overflow-hidden`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
          {label}
        </span>
        <span className="material-symbols-outlined text-[20px] opacity-20">
          {icon}
        </span>
      </div>
      <p className="text-3xl font-black tracking-tight text-slate-800">
        {value}
      </p>
      <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 overflow-hidden border border-slate-50">
        <div
          className={`h-full opacity-60 rounded-full ${
            color === "red"
              ? "bg-red-500"
              : color === "amber"
              ? "bg-amber-500"
              : "bg-blue-500"
          }`}
          style={{ width: "65%" }}
        ></div>
      </div>
    </div>
  );
};

const QuickButton = ({ icon, label, onClick, color }: any) => {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100",
    green: "text-green-600 bg-green-50 border-green-100 hover:bg-green-100",
    purple:
      "text-purple-600 bg-purple-50 border-purple-100 hover:bg-purple-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100",
  };
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 group ${colors[color]}`}
    >
      <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <span className="text-[10px] font-black uppercase text-center tracking-tighter">
        {label}
      </span>
    </button>
  );
};
