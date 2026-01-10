import React, { useState } from "react";
import { UserRole, RoleLabels } from "../../types";
import { GOD_MODE_CREDENTIALS } from "../../utils/saseUtils";

const QRCodeSVG = ({ url }: { url: string }) => {
  // Simple QR Placeholder (In real app better use a lib like qrcode.react)
  return (
    <div className="bg-white p-2 rounded-lg border-2 border-black inline-block">
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
          url
        )}`}
        alt="Login QR"
        className="size-32"
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

    // HTML Template for Print
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Carta de Acceso SASE-310</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
          body { font-family: 'Montserrat', sans-serif; background: #fff; color: #000; margin: 0; padding: 40px; }
          .container { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 40px; position: relative; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .logo { max-width: 150px; margin-bottom: 10px; }
          .title { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
          .subtitle { font-size: 14px; text-transform: uppercase; color: #555; margin-top: 5px; }
          .content { line-height: 1.6; font-size: 16px; margin-bottom: 40px; }
          .credentials-box { background: #f5f5f5; border: 2px dashed #333; padding: 20px; margin: 30px 0; text-align: center; border-radius: 10px; }
          .cred-item { margin: 10px 0; font-size: 18px; }
          .cred-label { font-weight: bold; text-transform: uppercase; font-size: 12px; color: #666; }
          .cred-value { font-family: monospace; font-size: 24px; font-weight: bold; color: #000; }
          .qr-section { text-align: center; margin-top: 40px; }
          .footer { margin-top: 60px; font-size: 10px; text-align: center; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; color: rgba(0,0,0,0.03); font-weight: bold; z-index: -1; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="watermark">CONFIDENCIAL</div>
          <div class="header">
            <img src="/assets/branding/logo-full.png" alt="SASE Logo" class="logo" onerror="this.src='https://via.placeholder.com/150?text=SASE+LOGO'">
            <div class="title">Credenciales de Acceso</div>
            <div class="subtitle">Sistema de Administración Escolar SASE-310</div>
          </div>

          <div class="content">
            <p>Estimado(a) <strong>${customName || roleLabel}</strong>,</p>
            <p>Se le ha asignado acceso oficial a la plataforma SASE-310 para el ciclo escolar 2024-2025. Esta herramienta centraliza la gestión de incidencias, asistencia y expediente digital de nuestra institución.</p>
            <p>A continuación, encontrará sus credenciales personales e intransferibles. Por favor, asegúrese de iniciar sesión y cambiar su contraseña en el primer acceso si el sistema lo solicita.</p>
            
            <div class="credentials-box">
              <div class="cred-item">
                <div class="cred-label">Usuario / Correo Institucional</div>
                <div class="cred-value">${creds.user}</div>
              </div>
              <div class="cred-item">
                <div class="cred-label">Contraseña Temporal</div>
                <div class="cred-value">${creds.pass}</div>
              </div>
              <div class="cred-item">
                <div class="cred-label">Rol Asignado</div>
                <div class="cred-value" style="color: #4f46e5;">${roleLabel.toUpperCase()}</div>
              </div>
            </div>

            <p>Para ingresar, puede escanear el siguiente código QR con su dispositivo móvil o acceder directamente a la dirección web desde una computadora.</p>
          </div>

          <div class="qr-section">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
              accessLink
            )}" alt="Acceso QR" width="150" />
            <p style="font-size: 12px; margin-top: 10px;">${accessLink}</p>
          </div>

          <div class="footer">
            <p>Este documento contiene información sensible. Si usted no es el destinatario, por favor destrúyalo. © 2024 SASE Systems.</p>
          </div>
        </div>
        <script>
          setTimeout(() => { window.print(); }, 500);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-white/10 shadow-2xl max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-amber-500/20 p-3 rounded-full text-amber-500">
          <span className="material-symbols-outlined text-2xl">mail_lock</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            Generador de Cartas de Acceso
          </h2>
          <p className="text-gray-400 text-sm">
            Crea documentos PDF oficiales para entregar credenciales.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-400 text-xs font-bold uppercase mb-2">
            Seleccionar Rol
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition-colors"
          >
            {Object.values(UserRole).map((role) => (
              <option key={role} value={role}>
                {RoleLabels[role]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-400 text-xs font-bold uppercase mb-2">
            Nombre del Destinatario (Opcional)
          </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Ej. Prof. Juan Pérez"
            className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition-colors"
          />
        </div>
      </div>

      <div className="bg-black/20 p-4 rounded-lg border border-white/5 mb-6 flex gap-4 items-center">
        <QRCodeSVG url={accessLink} />
        <div className="text-sm text-gray-400">
          <p>Se generará un documento con este código QR.</p>
          <p className="mt-1 text-xs">
            Destino: <span className="text-amber-400">{accessLink}</span>
          </p>
        </div>
      </div>

      <button
        onClick={handlePrint}
        className="w-full py-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/40 transition-all flex items-center justify-center gap-2 transform active:scale-95"
      >
        <span className="material-symbols-outlined">print</span>
        Generar e Imprimir Carta
      </button>
    </div>
  );
};
