import React, { useState } from "react";
import { UserRole, RoleLabels } from "../../types";
import { GOD_MODE_CREDENTIALS } from "../../utils/saseUtils";

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
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.DOCENTE);
  const [customName, setCustomName] = useState("");

  const accessLink = window.location.origin;

  const credentialsMap: Partial<
    Record<UserRole, { user: string; pass: string }>
  > = {
    [UserRole.DIRECTIVO]: { user: "director@sase.mx", pass: "dir2024" },
    [UserRole.DOCENTE]: { user: "docente@sase.mx", pass: "prof123" },
    [UserRole.DOCENTE_TUTOR]: { user: "tutor@sase.mx", pass: "tutor123" },
    [UserRole.PREFECTURA]: { user: "prefecto@sase.mx", pass: "pref987" },
    [UserRole.ORIENTACION]: { user: "orientacion@sase.mx", pass: "ori456" },
    [UserRole.TRABAJO_SOCIAL]: { user: "tsocial@sase.mx", pass: "tsoc321" },
    [UserRole.ENFERMERIA]: { user: "salud@sase.mx", pass: "med555" },
    [UserRole.DEVELOPER]: {
      user: GOD_MODE_CREDENTIALS.email,
      pass: GOD_MODE_CREDENTIALS.password,
    },
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const creds = credentialsMap[selectedRole] || {
      user: "usuario@sase.mx",
      pass: "******",
    };
    const roleLabel = RoleLabels[selectedRole];

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Carta de Acceso SASE-310</title>
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
            <img src="/assets/branding/logo-full.png" alt="SASE Logo" class="logo" onerror="this.src='/assets/branding/SASE_LOGO.png'">
            <div class="title">Credenciales de Acceso</div>
            <div class="subtitle">Secretaría de Educación Pública • SASE-310</div>
          </div>

          <div class="content">
            <p>Estimado(a) <strong>${customName || roleLabel}</strong>,</p>
            <p>Se formaliza su acceso al ecosistema digital <strong>SASE-310</strong> para el presente periodo académico. Este sistema es el canal oficial para la gestión educativa y operativa de nuestra institución.</p>
            <p>Sus credenciales son de uso estrictamente confidencial. Se recomienda realizar su primer ingreso desde una conexión segura.</p>
            
            <div class="credentials-box">
              <div class="cred-item">
                <div class="cred-label">Identificador de Usuario</div>
                <div class="cred-value">${creds.user}</div>
              </div>
              <div class="cred-item">
                <div class="cred-label">Clave Temporal de Acceso</div>
                <div class="cred-value">${creds.pass}</div>
              </div>
              <div class="cred-item">
                <div class="cred-label">Responsabilidad Asignada</div>
                <div class="role-badge">${roleLabel}</div>
              </div>
            </div>

            <p>Para un acceso ágil, escanee el código QR adjunto o diríjase a la URL institucional indicada.</p>
          </div>

          <div class="qr-section">
            <div class="qr-box">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                accessLink,
              )}" alt="Acceso QR" width="120" />
            </div>
            <p style="font-size: 11px; margin-top: 15px; font-weight: 800; color: #64748b;">${accessLink}</p>
          </div>

          <div class="footer">
            <p>Documento oficial emitido por el Departamento de Control Escolar SASE-310. © 2024-2025.</p>
          </div>
        </div>
        <script>
          setTimeout(() => { window.print(); }, 800);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-5">
        <div className="bg-amber-100/50 p-4 rounded-2xl text-amber-700 border border-amber-200/50">
          <span className="material-symbols-outlined text-3xl">mail_lock</span>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">
            Cartas de Acceso
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
            Generación de credenciales impresas oficiales
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
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-black text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none uppercase"
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
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-black text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none uppercase"
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
            <span className="material-symbols-outlined text-[16px] text-amber-600">
              link
            </span>
            {accessLink}
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase italic">
            El código QR redirige al portal de acceso institucional vigente.
          </p>
        </div>
      </div>

      <button
        onClick={handlePrint}
        className="w-full py-5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-amber-900/10 transition-all flex items-center justify-center gap-3 transform active:scale-[0.98]"
        title="Generar e imprimir carta de credenciales oficial"
      >
        <span className="material-symbols-outlined text-[20px]">print</span>
        Imprimir Carta de Credenciales
      </button>
    </div>
  );
};
