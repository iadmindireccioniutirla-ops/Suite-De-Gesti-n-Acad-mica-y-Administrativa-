import { useState } from 'react';
import {
  Check,
  Copy,
  FileCheck2,
  Printer,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { DOCUMENT_TEMPLATES } from '../data/initialData';
import type { DocumentType, OfficialDocumentDraft } from '../types/academic';
import { InstitutionalLogo } from './InstitutionalMedia';

interface DocumentsModuleProps {
  draft: OfficialDocumentDraft;
  onChangeDraft: (next: OfficialDocumentDraft) => void;
}

const DOC_TYPES: DocumentType[] = [
  'Memorando',
  'Circular',
  'Oficio',
  'Acta de Reunión',
  'Informe de Gestión',
  'Comunicado',
];

export function DocumentsModule({ draft, onChangeDraft }: DocumentsModuleProps) {
  const [copied, setCopied] = useState(false);

  const handleSelectDocType = (docType: DocumentType) => {
    const template = DOCUMENT_TEMPLATES[docType];
    onChangeDraft({
      ...template,
      cityAndDate: draft.cityAndDate || 'Puerto Ordaz, Estado Bolívar, [FECHA]',
    });
  };

  const handleInsertTodayDate = () => {
    const formatted = new Intl.DateTimeFormat('es-VE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
    onChangeDraft({
      ...draft,
      cityAndDate: `Puerto Ordaz, Estado Bolívar, ${formatted}`,
    });
  };

  const handleResetTemplate = () => {
    const template = DOCUMENT_TEMPLATES[draft.docType];
    onChangeDraft({
      ...template,
      cityAndDate: 'Puerto Ordaz, Estado Bolívar, [FECHA]',
    });
  };

  const buildPlainTextDocument = () => {
    const lines = [
      'REPÚBLICA BOLIVARIANA DE VENEZUELA',
      'MINISTERIO DEL PODER POPULAR PARA LA EDUCACIÓN UNIVERSITARIA',
      'INSTITUTO UNIVERSITARIO DE TECNOLOGÍA INDUSTRIAL "RODOLFO LOERO ARISMENDI" (IUTIRLA)',
      'EXTENSIÓN PUERTO ORDAZ — CIUDAD GUAYANA, ESTADO BOLÍVAR',
      '------------------------------------------------------------------------',
      draft.isConfidential ? '*** DOCUMENTO DE USO CONFIDENCIAL / RESERVADO ***' : '',
      `${draft.docType.toUpperCase()} — ${draft.correlative}`,
      draft.cityAndDate,
      '',
      `DE: ${draft.senderOffice}`,
      `PARA: ${draft.recipient}`,
      `ASUNTO: ${draft.subject}`,
      '',
      draft.body,
      '',
      '------------------------------------------------------------------------',
      draft.signerName,
      draft.signerRole,
    ].filter((line, idx, arr) => !(line === '' && arr[idx - 1] === ''));

    return lines.join('\n');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainTextDocument());
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="no-print flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#8B0000]">
            Correspondencia Institucional · Membrete Oficial
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Generador de Documentos Oficiales
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl">
            Redacte memorandos, circulares, oficios, actas, informes y comunicados bajo la norma
            formal universitaria. Conserve los marcadores entre corchetes{' '}
            <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
              [EJEMPLO]
            </span>{' '}
            cuando falten datos oficiales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar plantilla
          </button>
          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                Texto copiado
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copiar texto
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#8B0000] rounded-lg hover:bg-[#6E0000] transition-colors whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir / Exportar PDF
          </button>
        </div>
      </div>

      {/* Selector de Tipo de Documento */}
      <div className="no-print flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit">
        {DOC_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handleSelectDocType(type)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              draft.docType === type
                ? 'bg-white text-[#8B0000] shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Formulario de Redacción */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="no-print xl:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#8B0000]" />
              Datos del Documento
            </h3>
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={draft.isConfidential}
                onChange={(e) =>
                  onChangeDraft({ ...draft, isConfidential: e.target.checked })
                }
                className="rounded border-slate-300 text-[#8B0000] focus:ring-[#8B0000]"
              />
              <span className="inline-flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Uso confidencial
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Correlativo / N° Oficial
              </label>
              <input
                type="text"
                value={draft.correlative}
                onChange={(e) => onChangeDraft({ ...draft, correlative: e.target.value })}
                placeholder="IUTIRLA-PZO-[N° EJEMPLO]"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  Lugar y Fecha
                </label>
                <button
                  type="button"
                  onClick={handleInsertTodayDate}
                  className="text-[11px] font-medium text-[#8B0000] hover:underline"
                >
                  Fecha de hoy
                </button>
              </div>
              <input
                type="text"
                value={draft.cityAndDate}
                onChange={(e) => onChangeDraft({ ...draft, cityAndDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Dependencia Emisora (De)
            </label>
            <input
              type="text"
              value={draft.senderOffice}
              onChange={(e) => onChangeDraft({ ...draft, senderOffice: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Destinatario (Para)
            </label>
            <input
              type="text"
              value={draft.recipient}
              onChange={(e) => onChangeDraft({ ...draft, recipient: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Asunto
            </label>
            <input
              type="text"
              value={draft.subject}
              onChange={(e) => onChangeDraft({ ...draft, subject: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Cuerpo Fundamentado
            </label>
            <textarea
              rows={9}
              value={draft.body}
              onChange={(e) => onChangeDraft({ ...draft, body: e.target.value })}
              className="w-full px-3 py-2 text-sm leading-relaxed border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 border-t border-slate-100">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Autoridad Firmante
              </label>
              <input
                type="text"
                value={draft.signerName}
                onChange={(e) => onChangeDraft({ ...draft, signerName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Cargo / Unidad
              </label>
              <input
                type="text"
                value={draft.signerRole}
                onChange={(e) => onChangeDraft({ ...draft, signerRole: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
              />
            </div>
          </div>
        </form>

        {/* Vista Previa Oficial (Imprimible) */}
        <div className="xl:col-span-7 print-only-container">
          <div className="bg-white border border-slate-200 rounded-lg p-8 sm:p-10 min-h-[760px] flex flex-col justify-between text-slate-900">
            <div className="space-y-6">
              {/* Membrete Institucional */}
              <header className="pb-4 border-b-2 border-[#8B0000]">
                <div className="flex items-center gap-4">
                  <InstitutionalLogo className="w-16 h-16 sm:w-18 sm:h-18" />
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-[11px] font-semibold tracking-wider text-slate-700">
                      REPÚBLICA BOLIVARIANA DE VENEZUELA
                    </p>
                    <p className="text-[11px] font-semibold tracking-wider text-slate-700">
                      MINISTERIO DEL PODER POPULAR PARA LA EDUCACIÓN UNIVERSITARIA
                    </p>
                    <h3 className="text-sm sm:text-base font-bold text-[#8B0000] mt-0.5">
                      INSTITUTO UNIVERSITARIO DE TECNOLOGÍA INDUSTRIAL &ldquo;RODOLFO LOERO ARISMENDI&rdquo;
                    </h3>
                    <p className="text-xs font-medium text-slate-600">
                      EXTENSIÓN PUERTO ORDAZ · CIUDAD GUAYANA, ESTADO BOLÍVAR
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-0.5 bg-[#B88D28]/60" />
              </header>

              {/* Aviso de Confidencialidad si aplica */}
              {draft.isConfidential && (
                <div className="border border-[#8B0000]/30 bg-[#FDF2F2] px-4 py-2 text-center text-xs font-semibold text-[#8B0000]">
                  DOCUMENTO DE CARÁCTER CONFIDENCIAL — TRATAMIENTO RESERVADO POR DIRECCIÓN / COORDINACIÓN ACADÉMICA
                </div>
              )}

              {/* Encabezado del Documento */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 text-sm">
                <div>
                  <span className="font-bold text-[#8B0000] text-base tracking-wide">
                    {draft.docType.toUpperCase()}
                  </span>
                  <span className="mx-2 text-slate-400">·</span>
                  <span className="font-mono text-xs font-semibold text-slate-700">
                    {draft.correlative}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700">{draft.cityAndDate}</p>
              </div>

              {/* Bloque Metadatos Formales */}
              <div className="border border-slate-200 rounded-md p-4 bg-slate-50/50 space-y-2 text-sm">
                <div className="grid grid-cols-[88px_1fr] gap-2">
                  <span className="font-semibold text-slate-700">DE:</span>
                  <span className="text-slate-900">{draft.senderOffice}</span>
                </div>
                <div className="grid grid-cols-[88px_1fr] gap-2">
                  <span className="font-semibold text-slate-700">PARA:</span>
                  <span className="text-slate-900">{draft.recipient}</span>
                </div>
                <div className="grid grid-cols-[88px_1fr] gap-2 pt-1 border-t border-slate-200/80">
                  <span className="font-semibold text-slate-700">ASUNTO:</span>
                  <span className="font-semibold text-slate-900">{draft.subject}</span>
                </div>
              </div>

              {/* Cuerpo */}
              <div className="text-sm leading-7 text-slate-800 whitespace-pre-wrap text-justify">
                {draft.body}
              </div>
            </div>

            {/* Bloque de Firma */}
            <footer className="mt-14 pt-6 print-break-inside-avoid">
              <div className="max-w-xs mx-auto text-center space-y-1">
                <div className="border-t border-slate-900 pt-2">
                  <p className="text-sm font-bold text-slate-900">{draft.signerName}</p>
                  <p className="text-xs text-slate-600">{draft.signerRole}</p>
                </div>
                <p className="text-[11px] text-slate-400 pt-2">
                  [SELLO HÚMEDO INSTITUCIONAL — EXTENSIÓN PUERTO ORDAZ]
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
