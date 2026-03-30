import React, { useState } from "react";
import toast from "react-hot-toast";
import DOMPurify from "dompurify";
import { UserRole, RoleLabels } from "../../types";
import { useAuth } from "../AuthProvider";

const QRCodeSVG = ({ url }: { url: string }) => {
  return (
    <div className="bg-white p-2.5 rounded-xl border border-slate-200 inline-block shadow-sm">
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
          url,
        )}`}
        alt="Login QR"
        className="size-32 mix-blend-multiply"
      />
    </div>
  );
};

export const InvitationGenerator: React.FC = () => {
  const { session } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.DOCENTE);
  const [customName, setCustomName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const accessLink = window.location.origin;

  const emailRegex = /^[a-z]+\.[a-z]+@sase\.mx$/;

  const handleInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!emailRegex.test(email)) {
      toast.error("Correo institucional inválido. Use nombre.apellido@sase.mx");
      return;
    }

    if (!session?.access_token) {
      toast.error("Debe iniciar sesión para enviar invitaciones.");
      return;
    }

    setIsInviting(true);
    try {
      const response = await fetch("/api/auth/invite-staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email,
          role: selectedRole,
          fullName: customName.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || "No se pudo enviar la invitación");
      }

      toast.success("Invitación enviada al correo institucional");
    } catch (error: any) {
      toast.error(error?.message || "Error al enviar la invitación");
    } finally {
      setIsInviting(false);
    }
  };

  const roleDetails: Record<
    UserRole,
    { icons: { icon: string; label: string; desc: string }[] }
  > = {
    [UserRole.DIRECTIVO]: {
      icons: [
        {
          icon: "terminal",
          label: "Command Center",
          desc: "Vista estratégica global del plantel.",
        },
        {
          icon: "monitoring",
          label: "Radar de Estabilidad",
          desc: "Monitoreo de clima y casos críticos.",
        },
        {
          icon: "psychology",
          label: "Matriz de Decisión",
          desc: "Análisis táctico con IA para protocolos.",
        },
        {
          icon: "verified_user",
          label: "Aprobaciones",
          desc: "Validación de personal y movimientos.",
        },
      ],
    },
    [UserRole.DOCENTE]: {
      icons: [
        {
          icon: "auto_awesome",
          label: "Planeación NEM",
          desc: "Diseño de clases con asistencia de IA.",
        },
        {
          icon: "fact_check",
          label: "Pase de Lista",
          desc: "Control de asistencia digital en tiempo real.",
        },
        {
          icon: "description",
          label: "Reportes de Grupo",
          desc: "Generación de informes de aprovechamiento.",
        },
        {
          icon: "send",
          label: "Dictado IA",
          desc: "Registro de incidencias por voz.",
        },
      ],
    },
    [UserRole.DOCENTE_TUTOR]: {
      icons: [
        {
          icon: "groups",
          label: "Gestión de Tutoría",
          desc: "Seguimiento grupal y comunicación con padres.",
        },
        {
          icon: "analytics",
          label: "Estatus de Riesgo",
          desc: "Identificación de alumnos vulnerables.",
        },
      ],
    },
    [UserRole.PREFECTURA]: {
      icons: [
        {
          icon: "qr_code_scanner",
          label: "Escáner Táctico",
          desc: "Registro rápido por matrícula.",
        },
        {
          icon: "schedule",
          label: "Control de Retardos",
          desc: "Gestión de puntualidad automática.",
        },
        {
          icon: "campaign",
          label: "Alertas Campo",
          desc: "Notificación inmediata de incidencias.",
        },
      ],
    },
    [UserRole.ORIENTACION]: {
      icons: [
        {
          icon: "psychology",
          label: "Expediente Psicosocial",
          desc: "Seguimiento conductual y emocional.",
        },
        {
          icon: "handshake",
          label: "Acuerdos",
          desc: "Gestión de compromisos con padres.",
        },
      ],
    },
    [UserRole.TRABAJO_SOCIAL]: {
      icons: [
        {
          icon: "home",
          label: "Visitas Domiciliarias",
          desc: "Registro de contexto familiar.",
        },
        {
          icon: "diversity_3",
          label: "Canalización",
          desc: "Vinculación con instituciones externas.",
        },
      ],
    },
    [UserRole.MEDICO_ESCOLAR]: {
      icons: [
        {
          icon: "medical_services",
          label: "Expediente Clínico",
          desc: "Historial de salud y alergias.",
        },
        {
          icon: "inventory_2",
          label: "Control Insumos",
          desc: "Gestión de botiquín escolar.",
        },
        {
          icon: "emergency",
          label: "Emergencias",
          desc: "Protocolo de atención inmediata.",
        },
      ],
    },
    [UserRole.DEVELOPER]: {
      icons: [
        {
          icon: "code",
          label: "Acceso Root",
          desc: "Control total del sistema y base de datos.",
        },
      ],
    },
    [UserRole.GUEST]: {
      icons: [
        {
          icon: "visibility",
          label: "Vista de Invitado",
          desc: "Acceso limitado a información pública.",
        },
      ],
    },
    [UserRole.SECRETARIA]: {
      icons: [
        {
          icon: "folder_shared",
          label: "Archivo Digital",
          desc: "Gestión de documentos oficiales.",
        },
        {
          icon: "badge",
          label: "Credencialización",
          desc: "Generación de identidades SASE.",
        },
      ],
    },
    [UserRole.SUBDIRECCION]: {
      icons: [
        {
          icon: "account_tree",
          label: "Organigrama",
          desc: "Control de mandos y flujos.",
        },
        {
          icon: "task",
          label: "Seguimiento",
          desc: "Validación de metas institucionales.",
        },
      ],
    },
    [UserRole.UDEII]: {
      icons: [
        {
          icon: "psychology_alt",
          label: "Acompañamiento Especial",
          desc: "Detección y atención a barreras de aprendizaje.",
        },
        {
          icon: "edit_document",
          label: "Ajustes Razonables",
          desc: "Registro de estrategias de inclusión.",
        },
      ],
    },
    [UserRole.PROMOTORA_LECTURA]: {
      icons: [
        {
          icon: "auto_stories",
          label: "Plan de Lectura",
          desc: "Fomento a la lectura y actividades culturales.",
        },
        {
          icon: "military_tech",
          label: "Logros Lectores",
          desc: "Seguimiento de metas de comprensión lectora.",
        },
      ],
    },
    [UserRole.SYSTEM_ADMIN]: {
      icons: [
        {
          icon: "admin_panel_settings",
          label: "Administración del Sistema",
          desc: "Acceso total, bypass RLS, recuperación y mantenimiento.",
        },
      ],
    },
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const emailValue = inviteEmail.trim().toLowerCase() || "usuario@sase.mx";
    const roleLabel = RoleLabels[selectedRole];
    const details = roleDetails[selectedRole];

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Carta de Acceso SASE-310</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
          body { font-family: 'Montserrat', sans-serif; background: #fff; color: #1e293b; margin: 0; padding: 40px; }
          .container { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 60px; position: relative; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 50px; border-bottom: 2px solid #f1f5f9; padding-bottom: 30px; }
          .logo { max-width: 180px; margin-bottom: 15px; }
          .title { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; color: #0f172a; }
          .subtitle { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-top: 8px; letter-spacing: 2px; }
          .content { line-height: 1.7; font-size: 15px; margin-bottom: 50px; color: #334155; }
          .credentials-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 40px; margin: 40px 0; text-align: center; border-radius: 24px; }
          .cred-item { margin: 25px 0; }
          .cred-label { font-weight: 800; text-transform: uppercase; font-size: 10px; color: #94a3b8; letter-spacing: 1px; margin-bottom: 5px; }
          .cred-value { font-family: 'Courier New', monospace; font-size: 26px; font-weight: 900; color: #0f172a; }
          .role-badge { display: inline-block; padding: 6px 16px; background: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 900; border-radius: 100px; text-transform: uppercase; border: 1px solid #dbeafe; }
          
          .features-section { margin: 40px 0; padding: 30px; background: #0f172a; border-radius: 24px; color: white; }
          .features-title { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; color: #3b82f6; margin-bottom: 20px; }
          .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .feature-item { display: flex; gap: 15px; align-items: flex-start; }
          .feature-icon { color: #3b82f6; font-size: 24px; }
          .feature-text h4 { margin: 0; font-size: 13px; font-weight: 900; }
          .feature-text p { margin: 4px 0 0 0; font-size: 10px; color: #94a3b8; line-height: 1.4; }

          .qr-section { text-align: center; margin-top: 50px; }
          .qr-box { display: inline-block; padding: 15px; background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .footer { margin-top: 80px; font-size: 9px; text-align: center; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 30px; font-weight: 700; text-transform: uppercase; }
          .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 120px; color: rgba(0,0,0,0.02); font-weight: 900; z-index: -1; pointer-events: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="watermark">INSTITUCIONAL</div>
          <div class="header">
            <img src="/assets/branding/SASE_LOGO_PILOTO.png" alt="SASE Logo" class="logo" onerror="this.src='/assets/branding/SASE_LOGO.png'">
            <div class="title">Credenciales de Acceso</div>
            <div class="subtitle">Secretaría de Educación Pública • SASE-310</div>
          </div>

          <div class="content">
            <p>Estimado(a) <strong>${customName || roleLabel}</strong>,</p>
            <p>Se formaliza su acceso al ecosistema digital <strong>SASE-310</strong>. Este sistema es el centro de operaciones técnicas y pedagógicas de nuestro plantel.</p>
            
            <div class="credentials-box">
               <div class="cred-item">
                 <div class="cred-label">Correo Institucional</div>
                 <div class="cred-value">${emailValue}</div>
               </div>
               <div class="cred-item">
                 <div class="cred-label">Enlace de Activación</div>
                 <div class="cred-value">Se envía por correo</div>
               </div>
              <div class="cred-item">
               <div class="cred-label">Rol Asignado</div>
               <div class="role-badge">${roleLabel}</div>
             </div>
           </div>

            <div class="features-section">
              <div class="features-title">Herramientas Propias de su Perfil:</div>
              <div class="features-grid">
                ${details.icons
                  .map(
                    (f) => `
                  <div class="feature-item">
                    <span class="material-symbols-outlined feature-icon">${f.icon}</span>
                    <div class="feature-text">
                      <h4>${f.label}</h4>
                      <p>${f.desc}</p>
                    </div>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>

           <p>Use el enlace de activación enviado a su correo institucional para acceder al portal.</p>
         </div>

          <div class="qr-section">
            <div class="qr-box">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                accessLink,
              )}" alt="Acceso QR" width="120" />
            </div>
            <div style="font-size: 10px; margin-top: 15px; font-weight: 900; color: #64748b; letter-spacing: 2px;">LLAVE DE ACTIVACIÓN</div>
            <p style="font-size: 11px; margin-top: 5px; font-weight: 800; color: #3b82f6;">${accessLink}</p>
          </div>

          <div class="footer">
            <p>Documento oficial emitido por el Departamento de Control Escolar SASE-310. © 2024-2026.</p>
          </div>
        </div>
        <script>
          setTimeout(() => { window.print(); }, 800);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(DOMPurify.sanitize(content));
    printWindow.document.close();
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-5">
        <div className="bg-blue-100/50 p-4 rounded-2xl text-blue-700 border border-blue-200/50">
          <span className="material-symbols-outlined text-3xl">mail_lock</span>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">
            Cartas de Acceso
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
            Generación de credenciales impresas oficiales 2026
          </p>
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Rol Institucional
            </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-black text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none uppercase"
            title="Seleccionar el rol institucional para la carta de acceso"
          >
            {Object.values(UserRole).map((role) => (
              <option key={role} value={role}>
                {RoleLabels[role]}
              </option>
            ))}
          </select>
        </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Nombre del Destinatario
            </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="EJ. PROF. ALEJANDRO RAMÍREZ"
            title="Ingresar el nombre del destinatario de la carta"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-black text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none uppercase"
          />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Correo Institucional
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="nombre.apellido@sase.mx"
              title="Ingrese el correo institucional del personal"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-black text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            />
          </div>
        </div>

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex gap-6 items-center shadow-inner">
        <QRCodeSVG url={accessLink} />
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
            Previsualización de Enlace
          </p>
          <p className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-blue-600">
              link
            </span>
            {accessLink}
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase italic">
            El código QR redirige al portal de acceso institucional vigente.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleInvite}
          disabled={isInviting}
          className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-emerald-900/10 transition-all flex items-center justify-center gap-3 transform active:scale-[0.98] disabled:opacity-60"
          title="Enviar invitación segura por correo institucional"
        >
          <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
          {isInviting ? "Enviando Invitación" : "Enviar Invitación"}
        </button>
        <button
          onClick={handlePrint}
          className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-blue-900/10 transition-all flex items-center justify-center gap-3 transform active:scale-[0.98]"
          title="Generar e imprimir carta de credenciales oficial"
        >
          <span className="material-symbols-outlined text-[20px]">print</span>
          Imprimir Carta
        </button>
      </div>
    </div>
  );
};
