import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  ClipboardList,
  Copy,
  Download,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { STUDENT_PROCEDURES } from '../data/initialData';
import type {
  BulletinNotice,
  CalendarMilestone,
  StudentProcedure,
} from '../types/academic';

interface BulletinProceduresModuleProps {
  milestones: CalendarMilestone[];
  notices: BulletinNotice[];
  onUpdateMilestone: (milestone: CalendarMilestone) => void;
  onAddNotice: (notice: Omit<BulletinNotice, 'id'>) => void;
  onDeleteNotice: (id: string) => void;
  onCreateDocumentFromProcedure: (procedure: StudentProcedure) => void;
}

export function BulletinProceduresModule({
  milestones,
  notices,
  onUpdateMilestone,
  onAddNotice,
  onDeleteNotice,
  onCreateDocumentFromProcedure,
}: BulletinProceduresModuleProps) {
  const [activeTab, setActiveTab] = useState<'cartelera' | 'tramites'>('cartelera');
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [milestoneDraft, setMilestoneDraft] = useState<CalendarMilestone | null>(null);
  const [copiedBoard, setCopiedBoard] = useState(false);

  const [noticeForm, setNoticeForm] = useState({
    title: '',
    audience: 'Toda la Comunidad' as BulletinNotice['audience'],
    dateLabel: '[FECHA - EJEMPLO]',
    summary: '',
    priority: 'Ordinario' as BulletinNotice['priority'],
  });

  const [procedureFilter, setProcedureFilter] = useState<
    'Todos' | 'Control de Estudios' | 'Requisitos de Egreso'
  >('Todos');
  const [procedureSearch, setProcedureSearch] = useState('');
  const [selectedProcedureId, setSelectedProcedureId] = useState<string>(
    STUDENT_PROCEDURES[0].id,
  );

  const filteredProcedures = useMemo(() => {
    const q = procedureSearch.trim().toLowerCase();
    return STUDENT_PROCEDURES.filter((proc) => {
      if (procedureFilter !== 'Todos' && proc.category !== procedureFilter) return false;
      if (q) {
        const text =
          `${proc.title} ${proc.description} ${proc.requirements.join(' ')} ${proc.approvals.join(' ')}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [procedureFilter, procedureSearch]);

  const activeProcedure =
    filteredProcedures.find((p) => p.id === selectedProcedureId) ??
    filteredProcedures[0] ??
    null;

  const startEditMilestone = (item: CalendarMilestone) => {
    setEditingMilestoneId(item.id);
    setMilestoneDraft({ ...item });
  };

  const saveMilestone = () => {
    if (milestoneDraft) {
      onUpdateMilestone(milestoneDraft);
    }
    setEditingMilestoneId(null);
    setMilestoneDraft(null);
  };

  const handleCopyCalendarTsv = async () => {
    const headers = ['Fase', 'Actividad', 'Fecha / Lapso', 'Responsable', 'Estado'];
    const rows = milestones.map((m) => [
      m.phase,
      m.activity,
      m.dateLabel,
      m.responsible,
      m.status,
    ]);
    const tsv = [headers, ...rows].map((r) => r.join('\t')).join('\n');
    try {
      await navigator.clipboard.writeText(tsv);
      setCopiedBoard(true);
      setTimeout(() => setCopiedBoard(false), 2200);
    } catch {
      setCopiedBoard(false);
    }
  };

  const handleDownloadCalendarCsv = () => {
    const headers = ['Fase', 'Actividad', 'Fecha / Lapso', 'Responsable', 'Estado'];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = milestones.map((m) =>
      [m.phase, m.activity, m.dateLabel, m.responsible, m.status].map(escape).join(','),
    );
    const csv = '\uFEFF' + [headers.map(escape).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cronograma-trimestral-iutirla-pzo.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.summary.trim()) return;
    onAddNotice({
      title: noticeForm.title.trim(),
      audience: noticeForm.audience,
      dateLabel: noticeForm.dateLabel.trim() || '[FECHA - EJEMPLO]',
      summary: noticeForm.summary.trim(),
      priority: noticeForm.priority,
    });
    setNoticeForm({
      title: '',
      audience: 'Toda la Comunidad',
      dateLabel: '[FECHA - EJEMPLO]',
      summary: '',
      priority: 'Ordinario',
    });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Pestañas */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#8B0000]">
            Información Institucional · Control Académico y Egreso
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Cartelera Digital y Guía de Trámites
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl">
            Consulte o actualice el cronograma trimestral y revise los recaudos, lapsos y
            aprobaciones previas exigidas para los trámites estudiantiles.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('cartelera')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'cartelera'
                ? 'bg-white text-[#8B0000] shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Cronograma y Cartelera
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tramites')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'tramites'
                ? 'bg-white text-[#8B0000] shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Guía de Trámites ({STUDENT_PROCEDURES.length})
          </button>
        </div>
      </div>

      {activeTab === 'cartelera' ? (
        <div className="space-y-8">
          {/* Tabla de Cronograma Trimestral */}
          <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Cronograma Trimestral Estructurado
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Las fechas no confirmadas conservan marcadores [EJEMPLO] hasta su carga oficial
                  por Dirección.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyCalendarTsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap"
                >
                  {copiedBoard ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar tabla
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCalendarCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-4">Etapa del Trimestre</th>
                    <th className="py-3 px-4">Actividad Académica / Administrativa</th>
                    <th className="py-3 px-4">Fecha / Lapso</th>
                    <th className="py-3 px-4">Responsable</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Editar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {milestones.map((item) => {
                    const isEditing = editingMilestoneId === item.id && milestoneDraft;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {item.phase}
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-md">
                          {isEditing ? (
                            <input
                              type="text"
                              value={milestoneDraft.activity}
                              onChange={(e) =>
                                setMilestoneDraft({
                                  ...milestoneDraft,
                                  activity: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1 border border-slate-300 rounded"
                            />
                          ) : (
                            item.activity
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono whitespace-nowrap text-slate-800">
                          {isEditing ? (
                            <input
                              type="text"
                              value={milestoneDraft.dateLabel}
                              onChange={(e) =>
                                setMilestoneDraft({
                                  ...milestoneDraft,
                                  dateLabel: e.target.value,
                                })
                              }
                              className="w-48 px-2.5 py-1 border border-slate-300 rounded font-mono"
                            />
                          ) : (
                            item.dateLabel
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {item.responsible}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isEditing ? (
                            <select
                              value={milestoneDraft.status}
                              onChange={(e) =>
                                setMilestoneDraft({
                                  ...milestoneDraft,
                                  status: e.target.value as CalendarMilestone['status'],
                                })
                              }
                              className="px-2 py-1 border border-slate-300 rounded bg-white"
                            >
                              <option value="Pendiente de fecha">Pendiente de fecha</option>
                              <option value="Programado">Programado</option>
                              <option value="En curso">En curso</option>
                            </select>
                          ) : (
                            <span
                              className={`font-medium ${
                                item.status === 'En curso'
                                  ? 'text-[#16A34A]'
                                  : item.status === 'Programado'
                                    ? 'text-[#8B0000]'
                                    : 'text-amber-700'
                              }`}
                            >
                              {item.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {isEditing ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={saveMilestone}
                                className="p-1 text-[#16A34A] hover:bg-emerald-50 rounded"
                                aria-label="Guardar hito"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMilestoneId(null);
                                  setMilestoneDraft(null);
                                }}
                                className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                                aria-label="Cancelar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEditMilestone(item)}
                              className="p-1 text-slate-500 hover:text-[#8B0000] hover:bg-slate-100 rounded"
                              aria-label={`Editar fecha de ${item.phase}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Cartelera de Avisos + Publicar Nuevo Aviso */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="xl:col-span-7 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-semibold text-slate-900">
                  Avisos Publicados en Cartelera Digital
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comunicaciones operativas vigentes para docentes y estudiantes
                </p>
              </div>

              {notices.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">
                  No hay avisos activos en cartelera.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {notices.map((notice) => (
                    <li key={notice.id} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span
                              className={
                                notice.priority === 'Prioritario'
                                  ? 'font-semibold text-[#8B0000]'
                                  : 'font-medium text-slate-700'
                              }
                            >
                              {notice.priority}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>Dirigido a: {notice.audience}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono">{notice.dateLabel}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-slate-900">
                            {notice.title}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteNotice(notice.id)}
                          aria-label={`Eliminar aviso ${notice.title}`}
                          className="p-1.5 text-slate-400 hover:text-[#DC2626] hover:bg-red-50 rounded-md shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-600">{notice.summary}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form
              onSubmit={handlePublishNotice}
              className="xl:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-3.5"
            >
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
                Publicar Aviso en Cartelera
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Título del aviso
                </label>
                <input
                  type="text"
                  required
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  placeholder="Ej. Recepción de recaudos para TEG"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Público destinatario
                  </label>
                  <select
                    value={noticeForm.audience}
                    onChange={(e) =>
                      setNoticeForm({
                        ...noticeForm,
                        audience: e.target.value as BulletinNotice['audience'],
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#8B0000]"
                  >
                    <option value="Toda la Comunidad">Toda la Comunidad</option>
                    <option value="Docentes">Docentes</option>
                    <option value="Estudiantes">Estudiantes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) =>
                      setNoticeForm({
                        ...noticeForm,
                        priority: e.target.value as BulletinNotice['priority'],
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#8B0000]"
                  >
                    <option value="Ordinario">Ordinario</option>
                    <option value="Prioritario">Prioritario</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Fecha o Lapso
                </label>
                <input
                  type="text"
                  value={noticeForm.dateLabel}
                  onChange={(e) => setNoticeForm({ ...noticeForm, dateLabel: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#8B0000]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contenido del aviso
                </label>
                <textarea
                  rows={3}
                  required
                  value={noticeForm.summary}
                  onChange={(e) => setNoticeForm({ ...noticeForm, summary: e.target.value })}
                  placeholder="Redacte indicaciones claras y formales..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#8B0000] rounded-lg hover:bg-[#6E0000] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Publicar en cartelera
              </button>
            </form>
          </section>
        </div>
      ) : (
        /* Pestaña Guía Operativa de Trámites */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Lista y Filtros */}
          <div className="xl:col-span-5 bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={procedureSearch}
                  onChange={(e) => setProcedureSearch(e.target.value)}
                  placeholder="Buscar trámite o recaudo..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#8B0000]"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(['Todos', 'Control de Estudios', 'Requisitos de Egreso'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setProcedureFilter(cat)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap ${
                      procedureFilter === cat
                        ? 'bg-white text-[#8B0000] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <ul className="divide-y divide-slate-100">
              {filteredProcedures.length === 0 ? (
                <li className="p-6 text-center text-xs text-slate-500">
                  No se encontraron trámites que coincidan con la búsqueda.
                </li>
              ) : (
                filteredProcedures.map((proc) => {
                  const selected = activeProcedure?.id === proc.id;
                  return (
                    <li key={proc.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedProcedureId(proc.id)}
                        className={`w-full text-left px-4 py-3.5 transition-colors ${
                          selected ? 'bg-[#FDF2F2]' : 'hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-[11px] font-medium text-slate-500">{proc.category}</p>
                        <p
                          className={`text-sm font-semibold mt-0.5 ${
                            selected ? 'text-[#8B0000]' : 'text-slate-900'
                          }`}
                        >
                          {proc.title}
                        </p>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          {/* Ficha Operativa Detallada */}
          <div className="xl:col-span-7 bg-white border border-slate-200 rounded-lg p-6">
            {activeProcedure ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#8B0000]">
                      {activeProcedure.category}
                    </p>
                    <h3 className="text-xl font-bold text-slate-900">{activeProcedure.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {activeProcedure.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCreateDocumentFromProcedure(activeProcedure)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#8B0000] rounded-lg hover:bg-[#6E0000] transition-colors whitespace-nowrap shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Generar circular / oficio
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Recaudos Obligatorios
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-800 list-disc pl-4">
                      {activeProcedure.requirements.map((req, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Lapsos Operativos
                      </h4>
                      <p className="text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                        {activeProcedure.timeframe}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Aprobaciones Previas / Instancias
                      </h4>
                      <ul className="space-y-1.5 text-sm text-slate-800 list-disc pl-4">
                        {activeProcedure.approvals.map((app, idx) => (
                          <li key={idx}>{app}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Condiciones y Prelaciones
                      </h4>
                      <ul className="space-y-1.5 text-sm text-slate-700 list-disc pl-4">
                        {activeProcedure.prerequisites.map((pre, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {pre}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">
                Seleccione un trámite de la lista para visualizar su ficha operativa.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
