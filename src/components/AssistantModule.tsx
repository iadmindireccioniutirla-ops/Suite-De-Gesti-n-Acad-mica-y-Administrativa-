import { Fragment, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  FileOutput,
  Loader2,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { ChatMessage, DocumentType, OfficialDocumentDraft } from '../types/academic';

interface AssistantModuleProps {
  messages: ChatMessage[];
  workspaceContext: string;
  onUpdateMessages: (next: ChatMessage[]) => void;
  onSendDraftToDocuments: (draft: Partial<OfficialDocumentDraft>) => void;
}

const QUICK_OPERATIONAL_PROMPTS = [
  {
    index: '1',
    title: 'Redacción de Documentos Oficiales',
    subtitle: 'Memorandos, circulares, actas o llamados de atención',
    prompt:
      '1. Necesito redactar un Memorando formal dirigido al personal docente de la Extensión Puerto Ordaz recordando la entrega puntual de planificaciones evaluativas del trimestre en curso. Usa marcadores [EJEMPLO] para los datos oficiales no suministrados.',
  },
  {
    index: '2',
    title: 'Planificación de Carga y Cronogramas',
    subtitle: 'Tablas trimestrales y distribución por turnos',
    prompt:
      '2. Genera una tabla estructurada de cronograma trimestral operativo (inicio, cortes evaluativos, recuperación y cierre) lista para copiar a cartelera u hoja de cálculo, usando marcadores [FECHA - EJEMPLO] donde falten fechas oficiales.',
  },
  {
    index: '3',
    title: 'Orientación para Trámites de Egreso',
    subtitle: 'Servicio Comunitario, Pasantías y TEG',
    prompt:
      '3. Redacta una guía breve y formal para coordinadores sobre la verificación de expedientes de Servicio Comunitario, Pasantías Profesionales y Trabajo Especial de Grado (TEG), señalando con marcadores los reglamentos internos a confirmar.',
  },
  {
    index: '4',
    title: 'Informes de Gestión Departamental',
    subtitle: 'Balances ejecutivos ante Consejo Académico',
    prompt:
      '4. Estructura un borrador de Informe de Gestión Trimestral para la Extensión Puerto Ordaz incorporando los indicadores actuales del sistema y marcadores [EJEMPLO] para cifras no registradas.',
  },
];

function renderInlineSegments(text: string) {
  const tokens = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\])/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('[') && token.endsWith(']') && token.length > 2) {
      return (
        <span
          key={idx}
          className="font-mono text-[12px] bg-amber-50 text-amber-900 border border-amber-200 px-1 py-0.5 rounded"
        >
          {token}
        </span>
      );
    }
    return <Fragment key={idx}>{token}</Fragment>;
  });
}

function FormattedResponse({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: Array<
    | { kind: 'heading'; level: number; text: string }
    | { kind: 'table'; headers: string[]; rows: string[][] }
    | { kind: 'list'; ordered: boolean; items: string[] }
    | { kind: 'paragraph'; text: string }
  > = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // Markdown table detection
    if (
      trimmed.startsWith('|') &&
      i + 1 < lines.length &&
      /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(lines[i + 1])
    ) {
      const parseRow = (rowLine: string) =>
        rowLine
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((cell) => cell.trim());

      const headers = parseRow(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(parseRow(lines[i]));
        i += 1;
      }
      blocks.push({ kind: 'table', headers, rows });
      continue;
    }

    // Heading
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        kind: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      i += 1;
      continue;
    }

    // Unordered / Ordered list
    if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const ordered = /^\d+\.\s+/.test(trimmed);
      const items: string[] = [];
      while (i < lines.length) {
        const current = lines[i].trim();
        if (ordered && /^\d+\.\s+/.test(current)) {
          items.push(current.replace(/^\d+\.\s+/, ''));
          i += 1;
        } else if (!ordered && /^[-*]\s+/.test(current)) {
          items.push(current.replace(/^[-*]\s+/, ''));
          i += 1;
        } else {
          break;
        }
      }
      blocks.push({ kind: 'list', ordered, items });
      continue;
    }

    // Paragraph accumulation
    const paraLines: string[] = [];
    while (i < lines.length) {
      const current = lines[i].trim();
      if (
        !current ||
        /^#{1,3}\s+/.test(current) ||
        /^[-*]\s+/.test(current) ||
        /^\d+\.\s+/.test(current) ||
        (current.startsWith('|') &&
          i + 1 < lines.length &&
          /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(lines[i + 1]))
      ) {
        break;
      }
      paraLines.push(current);
      i += 1;
    }
    blocks.push({ kind: 'paragraph', text: paraLines.join(' ') });
  }

  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-800">
      {blocks.map((block, idx) => {
        if (block.kind === 'heading') {
          return (
            <h4
              key={idx}
              className={`font-semibold text-slate-900 ${
                block.level === 1 ? 'text-base' : 'text-sm'
              }`}
            >
              {renderInlineSegments(block.text)}
            </h4>
          );
        }

        if (block.kind === 'table') {
          return (
            <div
              key={idx}
              className="overflow-x-auto border border-slate-200 rounded-lg bg-white my-2"
            >
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                    {block.headers.map((h, hIdx) => (
                      <th key={hIdx} className="py-2 px-3 whitespace-nowrap">
                        {renderInlineSegments(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {block.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/70">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2 px-3 text-slate-700">
                          {renderInlineSegments(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.kind === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul';
          return (
            <ListTag
              key={idx}
              className={`${
                block.ordered ? 'list-decimal' : 'list-disc'
              } pl-5 space-y-1 text-slate-800`}
            >
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>{renderInlineSegments(item)}</li>
              ))}
            </ListTag>
          );
        }

        return <p key={idx}>{renderInlineSegments(block.text)}</p>;
      })}
    </div>
  );
}

function parseDraftFromReply(text: string): Partial<OfficialDocumentDraft> {
  const lines = text.split('\n');
  let docType: DocumentType | undefined;
  let subject: string | undefined;
  let recipient: string | undefined;
  const remainingLines: string[] = [];

  for (const rawLine of lines) {
    const cleanLine = rawLine.replace(/\*\*/g, '').trim();
    const typeMatch = cleanLine.match(/^TIPO:\s*(.+)$/i);
    if (typeMatch) {
      const val = typeMatch[1].toLowerCase();
      if (val.includes('memorando')) docType = 'Memorando';
      else if (val.includes('circular')) docType = 'Circular';
      else if (val.includes('oficio')) docType = 'Oficio';
      else if (val.includes('acta')) docType = 'Acta de Reunión';
      else if (val.includes('informe')) docType = 'Informe de Gestión';
      else if (val.includes('comunicado')) docType = 'Comunicado';
      continue;
    }

    const subjectMatch = cleanLine.match(/^ASUNTO:\s*(.+)$/i);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      continue;
    }

    const recipientMatch = cleanLine.match(/^(DESTINATARIO|PARA):\s*(.+)$/i);
    if (recipientMatch) {
      recipient = recipientMatch[2].trim();
      continue;
    }

    remainingLines.push(rawLine.replace(/\*\*/g, ''));
  }

  const isConfidential = /confidencial|disciplinari|llamado de atenci[oó]n/i.test(text);

  return {
    ...(docType ? { docType } : {}),
    ...(subject ? { subject } : {}),
    ...(recipient ? { recipient } : {}),
    body: remainingLines.join('\n').trim(),
    isConfidential,
  };
}

export function AssistantModule({
  messages,
  workspaceContext,
  onUpdateMessages,
  onSendDraftToDocuments,
}: AssistantModuleProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isLoading) return;

    const nowLabel = new Intl.DateTimeFormat('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      text: trimmed,
      timestamp: nowLabel,
    };

    const nextHistory = [...messages, userMsg];
    onUpdateMessages(nextHistory);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => !m.error)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
          workspaceContext,
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };

      if (!res.ok || !data.reply) {
        const errMsg: ChatMessage = {
          id: `msg-${Date.now()}-err`,
          role: 'model',
          text:
            data.error ||
            'No fue posible obtener respuesta del servicio Gemini en este momento.',
          timestamp: nowLabel,
          error: true,
        };
        onUpdateMessages([...nextHistory, errMsg]);
        return;
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-m`,
        role: 'model',
        text: data.reply,
        timestamp: nowLabel,
      };
      onUpdateMessages([...nextHistory, aiMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: `msg-${Date.now()}-net`,
        role: 'model',
        text: 'Error de conexión con el servidor de la aplicación. Verifique que el servicio esté activo e intente nuevamente.',
        timestamp: nowLabel,
        error: true,
      };
      onUpdateMessages([...nextHistory, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#8B0000]">
            Protocolo ia-admin-direccion-iutirla · Cero Alucinaciones
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Asistente IA de Dirección (Gemini)
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl">
            Redacción institucional asistida, planificación de carga y orientación normativa con
            apego estricto a datos provistos. Envíe cualquier borrador directo al Generador de
            Documentos.
          </p>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => onUpdateMessages([])}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap self-start lg:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Nueva sesión
          </button>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          No incluya nombres, cédulas, calificaciones, expedientes ni otros datos personales o
          confidenciales. Las consultas se envían a Google Gemini para generar respuestas.
        </p>
      </div>

      {/* Menú Numérico Operativo 1 al 4 */}
      <section aria-label="Menú operativo rápido del asistente">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {QUICK_OPERATIONAL_PROMPTS.map((item) => (
            <button
              key={item.index}
              type="button"
              disabled={isLoading}
              onClick={() => void sendMessage(item.prompt)}
              className="text-left bg-white border border-slate-200 rounded-lg p-4 hover:border-[#8B0000]/50 hover:bg-slate-50/70 transition-colors disabled:opacity-50"
            >
              <span className="text-xs font-mono font-semibold text-[#8B0000]">
                Opción {item.index}
              </span>
              <p className="text-sm font-semibold text-slate-900 mt-1">{item.title}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.subtitle}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Ventana de Conversación */}
      <div className="bg-white border border-slate-200 rounded-lg flex flex-col h-[560px]">
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-3">
              <div className="w-11 h-11 rounded-lg bg-[#FDF2F2] border border-[#8B0000]/20 flex items-center justify-center text-[#8B0000]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Asistente Directivo — Extensión Puerto Ordaz
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seleccione una de las cuatro opciones operativas superiores o escriba su
                requerimiento (memorando, circular, cronograma, trámite de egreso o acta
                confidencial). Todo dato oficial no provisto se indicará con{' '}
                <span className="font-mono bg-amber-50 text-amber-900 px-1 rounded">
                  [EJEMPLO]
                </span>
                .
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-3xl rounded-lg px-4 py-3.5 ${
                    msg.role === 'user'
                      ? 'bg-[#8B0000] text-white'
                      : msg.error
                        ? 'bg-[#FDF2F2] border border-[#DC2626]/30 text-slate-900 w-full'
                        : 'bg-slate-50 border border-slate-200 text-slate-900 w-full'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1.5 text-[11px]">
                    <span
                      className={`font-semibold ${
                        msg.role === 'user'
                          ? 'text-white/90'
                          : msg.error
                            ? 'text-[#DC2626]'
                            : 'text-[#8B0000]'
                      }`}
                    >
                      {msg.role === 'user'
                        ? 'Dirección / Coordinación'
                        : msg.error
                          ? 'Aviso del servicio'
                          : 'Asistente IA de Dirección'}
                    </span>
                    <span
                      className={`font-mono tabular-nums ${
                        msg.role === 'user' ? 'text-white/75' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.role === 'user' ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  ) : msg.error ? (
                    <div className="flex items-start gap-2 text-xs text-[#DC2626] leading-relaxed">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{msg.text}</span>
                    </div>
                  ) : (
                    <>
                      <FormattedResponse content={msg.text} />
                      <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => void handleCopyMessage(msg.id, msg.text)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copiar respuesta
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onSendDraftToDocuments(parseDraftFromReply(msg.text))}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#8B0000] rounded-md hover:bg-[#6E0000] transition-colors"
                        >
                          <FileOutput className="w-3.5 h-3.5" />
                          Enviar borrador a Documentos Oficiales
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-start">
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-2.5 text-xs text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin text-[#8B0000]" />
                <span>Redactando respuesta conforme al protocolo institucional...</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Entrada de Consulta */}
        <form
          onSubmit={handleSubmit}
          className="p-3.5 border-t border-slate-200 bg-slate-50/70 flex items-end gap-2.5"
        >
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
            }}
            placeholder="Escriba su instrucción directiva (Enter para enviar, Shift+Enter para salto de línea)..."
            className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white bg-[#8B0000] rounded-lg hover:bg-[#6E0000] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
