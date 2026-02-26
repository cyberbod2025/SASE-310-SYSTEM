import React from "react";
import { Student, Justificante } from "../types";

interface DocumentProps {
  type: "JUSTIFICANTE" | "REPORTE_INCIDENCIA" | "BITACORA";
  student?: Student;
  data: any;
  schoolName?: string;
}

export const OfficialDocument: React.FC<DocumentProps> = ({
  type,
  student,
  data,
  schoolName = "ESCUELA SECUNDARIA DIURNA No. 310 'CUAHTEPEX'",
}) => {
  const today = new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      id="official-document"
      className="hidden print:block fixed inset-0 bg-white text-black p-12 font-serif z-[9999]"
    >
      {/* HEADER OFICIAL */}
      <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
        <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-[8px] text-center uppercase font-bold border border-black">
          ESCUDO
          <br />
          OFICIAL
          <br />
          SEP
        </div>
        <div className="flex-1 text-center px-8">
          <h1 className="text-lg font-black uppercase leading-tight mb-1">
            {schoolName}
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-700">
            Subdirección de Gestión Escolar // Turno Vespertino
          </p>
          <p className="text-[9px] font-bold mt-2">
            C.C.T. 09DES4310M | SISTEMA SASE 310 - NÚCLEO OPERATIVO
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase">FOLIO_SINCRO</p>
          <p className="text-lg font-mono font-bold text-red-600">
            {data.folio || "0000-0000"}
          </p>
        </div>
      </div>

      {/* TITULO DEL DOCUMENTO */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-black uppercase tracking-[0.2em] border-y border-black py-2 inline-block px-12 italic">
          {type.replace("_", " ")}
        </h2>
      </div>

      {/* CUERPO DEL DOCUMENTO */}
      <div className="space-y-8 text-sm leading-relaxed text-justify">
        <div className="flex justify-end font-bold">
          Ciudad de México, a {today}
        </div>

        {type === "JUSTIFICANTE" && (
          <div className="space-y-6">
            <p className="font-bold uppercase underline">
              A QUIEN CORRESPONDA / CUERPO DOCENTE:
            </p>
            <p>
              Por medio de la presente, el departamento de{" "}
              <strong>TRABAJO SOCIAL</strong> de esta institución educativa,
              hace constar que el C. estudiante{" "}
              <strong>{student?.name.toUpperCase()}</strong>, con matrícula
              <strong> {student?.matricula}</strong> del grupo{" "}
              <strong>{student?.group}</strong>, ha presentado la documentación
              necesaria para justificar sus inasistencias durante el periodo
              comprendido del
              <strong> {data.startDate}</strong> al{" "}
              <strong>{data.endDate}</strong>.
            </p>
            <p>
              <strong>MOTIVO DEL JUSTIFICANTE:</strong>{" "}
              {data.reason.toUpperCase()}
            </p>
            <p>
              <strong>OBSERVACIONES:</strong> {data.description || "Ninguna."}
            </p>
            {data.trabajoDistancia && (
              <div className="p-4 bg-gray-100 border-l-4 border-black font-bold italic">
                NOTA: El alumno cuenta con autorización para realizar TRABAJO A
                DISTANCIA durante este periodo. Se solicita a los docentes de
                grupo brindar las facilidades académicas pertinentes.
              </div>
            )}
          </div>
        )}

        {type === "REPORTE_INCIDENCIA" && (
          <div className="space-y-6">
            <p className="font-bold uppercase underline">
              REPORTE DE INCIDENCIA DISCIPLINARIA / CONDUCTUAL:
            </p>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 border border-black/10">
              <p>
                <strong>ALUMNO:</strong> {student?.name.toUpperCase()}
              </p>
              <p>
                <strong>GRUPO:</strong> {student?.group}
              </p>
              <p>
                <strong>FECHA:</strong> {data.date || today}
              </p>
              <p>
                <strong>CATEGORÍA:</strong> {data.type}
              </p>
            </div>
            <div className="space-y-4">
              <p>
                <strong>DESCRIPCIÓN DE LOS HECHOS:</strong>
              </p>
              <p className="p-4 border border-black/5 bg-white min-h-[150px] italic text-sm">
                "{data.description}"
              </p>
            </div>
          </div>
        )}

        {type === "BITACORA" && (
          <div className="space-y-6">
            <p className="font-bold uppercase underline">
              EXPEDIENTE DE APOYO ESPECIALIZADO (UDEII):
            </p>
            <p>
              Documento de seguimiento para la atención de Barreras para el
              Aprendizaje y la Participación (BAP).
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 border-l-4 border-indigo-900 text-sm">
                <p className="font-bold uppercase text-[10px] mb-2 text-indigo-900">
                  Ajustes Razonables Sugeridos:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  {data.accommodations?.map((a: string, i: number) => (
                    <li key={i}>{a}</li>
                  )) || <li>Sin ajustes registrados.</li>}
                </ul>
              </div>
              <p>
                <strong>DETALLES TÉCNICOS:</strong>{" "}
                {data.details ||
                  "Seguimiento periódico de trayectoria educativa."}
              </p>
              <p>
                <strong>ESTATUS DE INCLUSIÓN:</strong>{" "}
                {data.hasBAP ? "ACTIVO" : "INACTIVO"}
              </p>
            </div>
          </div>
        )}

        <div className="mt-20">
          <p>
            Se extiende la presente para los fines legales y administrativos que
            al interesado convengan.
          </p>
        </div>
      </div>

      {/* FOOTER - FIRMAS Y SELLOS */}
      <div className="mt-32 grid grid-cols-2 gap-20">
        <div className="text-center">
          <div className="border-t border-black pt-4">
            <p className="font-black uppercase text-[10px]">
              {data.issuedBy || "TRABAJO SOCIAL"}
            </p>
            <p className="text-[8px] text-gray-600 italic">
              SELLO Y FIRMA DE EMISIÓN
            </p>
          </div>
          <div className="size-24 border border-gray-300 mx-auto mt-4 flex items-center justify-center opacity-30 text-[8px] uppercase">
            Sello de la
            <br />
            Escuela
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-black pt-4">
            <p className="font-black uppercase text-[10px]">
              DIRECCIÓN DEL PLANTEL
            </p>
            <p className="text-[8px] text-gray-600 italic">
              VALIDACIÓN INSTITUCIONAL
            </p>
          </div>
          <div className="mt-4 flex flex-col items-center">
            {/* QRPlaceholder */}
            <div className="size-20 bg-black flex items-center justify-center text-white text-[8px] font-mono p-2 text-center uppercase">
              VALIDACIÓN QR SASE-DIGITAL
            </div>
            <p className="text-[7px] font-mono mt-2 text-gray-400">
              UUID: {Math.random().toString(36).substring(7).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* MARCA DE AGUA / SEGURIDAD */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-45deg] whitespace-nowrap text-8xl font-black pointer-events-none uppercase">
        CUAHTEPEX 310 SASE-CORE
      </div>
    </div>
  );
};
