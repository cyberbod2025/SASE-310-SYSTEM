import React from "react";
import DOMPurify from "dompurify";

interface PrintButtonsProps {
  compact?: boolean;
  title?: string;
  contentId?: string; // ID of the element to print
  fileName?: string; // Name for exported file
  onPrint?: () => void; // Custom print handler
}

export const PrintButtons: React.FC<PrintButtonsProps> = ({
  compact,
  title = "Documento",
  contentId,
  fileName = "reporte",
  onPrint,
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }

    // If contentId is provided, print only that element
    if (contentId) {
      const content = document.getElementById(contentId);
      if (!content) {
        alert("No se encontró el contenido para imprimir.");
        return;
      }

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        const sanitizedContent = DOMPurify.sanitize(content.innerHTML);
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${DOMPurify.sanitize(title)}</title>
            <style>
              body { 
                font-family: 'Inter', -apple-system, sans-serif; 
                padding: 20px;
                color: #1a1a1a;
              }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; font-weight: bold; }
              h1, h2, h3 { margin-bottom: 10px; }
              .header { 
                display: flex; 
                justify-content: space-between; 
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #1a1a1a;
                padding-bottom: 10px;
              }
              .header-title { font-size: 24px; font-weight: bold; }
              .header-date { font-size: 12px; color: #666; }
              .footer {
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #ddd;
                font-size: 10px;
                color: #888;
                text-align: center;
              }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="header-title">SASE-310 • ${DOMPurify.sanitize(title)}</div>
              <div class="header-date">${new Date().toLocaleDateString(
                "es-MX",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}</div>
            </div>
            ${sanitizedContent}
            <div class="footer">
              Sistema de Administración Escolar SASE-310 • Documento generado automáticamente • Propiedad de la institución
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    } else {
      // Default: print current page
      window.print();
    }
  };

  const handleExportPDF = () => {
    // For now, trigger print dialog which allows saving as PDF
    // (native browser "Save as PDF" option)
    alert(
      `Para guardar como PDF:\n\n1. Se abrirá el diálogo de impresión\n2. Seleccione "Guardar como PDF" o "Microsoft Print to PDF"\n3. Guarde el archivo como "${fileName}.pdf"`,
    );
    handlePrint();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrint}
        className="p-1.5 text-text-secondary hover:text-text-main hover:bg-gray-100 rounded transition-colors flex items-center"
        title="Imprimir Reporte"
      >
        <span className="material-icons text-[18px]">print</span>
        {!compact && <span className="ml-1 text-xs font-medium">Imprimir</span>}
      </button>
      <button
        onClick={handleExportPDF}
        className="p-1.5 text-text-secondary hover:text-blue-700 hover:bg-blue-50 rounded transition-colors flex items-center"
        title="Exportar PDF"
      >
        <span className="material-icons text-[18px]">
          picture_as_pdf
        </span>
        {!compact && <span className="ml-1 text-xs font-medium">PDF</span>}
      </button>
    </div>
  );
};

// Utility function for programmatic printing from any component
export const printContent = (title: string, htmlContent: string) => {
  const printWindow = window.open("", "_blank");
  const leftLogo = `${window.location.origin}/assets/branding/SASE.png`;
  const rightLogo = `${window.location.origin}/assets/branding/PILOTO.png`;
  if (printWindow) {
    const sanitizedContent = DOMPurify.sanitize(htmlContent);
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${DOMPurify.sanitize(title)}</title>
        <style>
          body { 
            font-family: 'Inter', -apple-system, sans-serif; 
            padding: 30px;
            color: #1a1a1a;
          }
          table { border-collapse: collapse; width: 100%; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; text-transform: uppercase; font-size: 11px; }
          h1 { font-size: 24px; margin-bottom: 5px; }
          h2 { font-size: 18px; margin-top: 20px; color: #333; }
          .badge { 
            display: inline-block; 
            padding: 3px 8px; 
            border-radius: 12px; 
            font-size: 11px; 
            font-weight: bold;
          }
          .badge-red { background: #fee2e2; color: #991b1b; }
          .badge-yellow { background: #fef3c7; color: #92400e; }
          .badge-green { background: #d1fae5; color: #065f46; }
          .badge-blue { background: #dbeafe; color: #1e40af; }
          
          /* Official Header with Logo */
          .official-header {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 25px;
            border-bottom: 3px double #1a1a1a;
            padding-bottom: 15px;
          }
          .official-logo {
            width: 100px;
            height: auto;
            flex-shrink: 0;
          }
          .official-info {
            flex: 1;
            text-align: center;
          }
          .official-sep { font-weight: bold; font-size: 12px; color: #666; margin-bottom: 2px; }
          .official-school { font-size: 16px; font-weight: 900; text-transform: uppercase; margin-bottom: 2px; }
          .official-name { font-size: 14px; font-weight: bold; color: #333; }
          .official-location { font-size: 11px; color: #666; margin-top: 3px; }
          .official-motto { font-size: 10px; font-style: italic; color: #888; margin-top: 5px; }
          
          .report-title {
            text-align: center;
            background: linear-gradient(90deg, #f5f5f5 0%, #e0e0e0 50%, #f5f5f5 100%);
            padding: 10px 20px;
            margin: 15px 0;
            border: 1px solid #ccc;
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .header-meta { 
            text-align: right; 
            font-size: 11px; 
            color: #888; 
            margin-top: -10px;
            margin-bottom: 15px;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 2px solid #ddd;
            font-size: 9px;
            color: #888;
            text-align: center;
          }
          .footer-system { font-weight: bold; margin-bottom: 3px; }
          
          .signature-line {
            margin-top: 60px;
            display: flex;
            justify-content: space-around;
          }
          .signature-box {
            text-align: center;
            width: 200px;
          }
          .signature-box .line {
            border-top: 1px solid #333;
            margin-bottom: 5px;
          }
          .signature-box .label {
            font-size: 10px;
            color: #666;
          }
          @media print {
            .no-print { display: none; }
            @page { margin: 1.5cm; }
          }
        </style>
      </head>
      <body>
        <!-- Official Header with Logo -->
        <div class="official-header">
          <img src="${leftLogo}" alt="Logo SASE" class="official-logo" />
          <div class="official-info">
            <div class="official-sep">SECRETARÍA DE EDUCACIÓN PÚBLICA</div>
            <div class="official-school">Escuela Secundaria Diurna No. 310</div>
            <div class="official-name">"Presidentes de México"</div>
            <div class="official-location">Turno Vespertino • Iztapalapa, CDMX</div>
            <div class="official-motto">"La Educación para un México Mejor"</div>
          </div>
        </div>
        
        <div class="header-meta">
          <div>Fecha: ${new Date().toLocaleDateString("es-MX", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</div>
          <div>Hora: ${new Date().toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
          })}</div>
        </div>
        
        <div class="report-title">${DOMPurify.sanitize(title)}</div>
        
        ${sanitizedContent}
        
        <div class="footer">
          <div class="footer-system">Sistema de Administración Escolar SASE-310</div>
          Documento generado automáticamente • Este documento es propiedad de la institución<br>
          Su reproducción no autorizada está prohibida
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
};
