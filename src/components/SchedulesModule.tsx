import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { DAYS_OF_WEEK, DEFAULT_QUARTER, SHIFTS, SPECIALTIES } from '../data/initialData';
import type {
  DayOfWeek,
  ScheduleConflict,
  ScheduleEntry,
  Shift,
  Specialty,
} from '../types/academic';
import { buildScheduleCSV, buildScheduleTSV } from '../utils/scheduleConflicts';
import { InstitutionalLogo } from './InstitutionalMedia';

interface SchedulesModuleProps {
  entries: ScheduleEntry[];
  conflicts: ScheduleConflict[];
  conflictingEntryIds: Set<string>;
  initialSpecialtyFilter?: Specialty | 'Todas';
  onAddEntry: (entry: Omit<ScheduleEntry, 'id'>) => void;
  onUpdateEntry: (entry: ScheduleEntry) => void;
  onDeleteEntry: (id: string) => void;
}

interface FormState {
  quarter: string;
  specialty: Specialty;
  shift: Shift;
  section: string;
  subjectCode: string;
  subjectName: string;
  teacher: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  classroom: string;
}

const EMPTY_FORM: FormState = {
  quarter: DEFAULT_QUARTER,
  specialty: 'Informática',
  shift: 'Diurno',
  section: '',
  subjectCode: '[CÓD-EJEMPLO]',
  subjectName: '',
  teacher: '',
  day: 'Lunes',
  startTime: '07:30',
  endTime: '09:45',
  classroom: '',
};

export function SchedulesModule({
  entries,
  conflicts,
  conflictingEntryIds,
  initialSpecialtyFilter = 'Todas',
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
}: SchedulesModuleProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [specialtyFilter, setSpecialtyFilter] = useState<Specialty | 'Todas'>(
    initialSpecialtyFilter,
  );
  const [shiftFilter, setShiftFilter] = useState<Shift | 'Todos'>('Todos');
  const [quarterFilter, setQuarterFilter] = useState<string>('Todos');
  const [sectionFilter, setSectionFilter] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyConflicts, setOnlyConflicts] = useState<boolean>(false);
  const [copiedTsv, setCopiedTsv] = useState<boolean>(false);

  const availableQuarters = useMemo(
    () => Array.from(new Set(entries.map((e) => e.quarter))),
    [entries],
  );

  const availableSections = useMemo(
    () => Array.from(new Set(entries.map((e) => e.section))).sort(),
    [entries],
  );

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return entries.filter((entry) => {
      if (specialtyFilter !== 'Todas' && entry.specialty !== specialtyFilter) return false;
      if (shiftFilter !== 'Todos' && entry.shift !== shiftFilter) return false;
      if (quarterFilter !== 'Todos' && entry.quarter !== quarterFilter) return false;
      if (sectionFilter !== 'Todas' && entry.section !== sectionFilter) return false;
      if (onlyConflicts && !conflictingEntryIds.has(entry.id)) return false;
      if (q) {
        const haystack =
          `${entry.subjectName} ${entry.subjectCode} ${entry.teacher} ${entry.classroom} ${entry.section}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [
    entries,
    specialtyFilter,
    shiftFilter,
    quarterFilter,
    sectionFilter,
    searchQuery,
    onlyConflicts,
    conflictingEntryIds,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (
      !form.section.trim() ||
      !form.subjectName.trim() ||
      !form.teacher.trim() ||
      !form.classroom.trim()
    ) {
      setFormError('Complete Sección, Asignatura, Docente y Aula para registrar el bloque.');
      return;
    }

    if (form.endTime <= form.startTime) {
      setFormError('La hora de finalización debe ser posterior a la hora de inicio.');
      return;
    }

    const payload = {
      quarter: form.quarter.trim() || DEFAULT_QUARTER,
      specialty: form.specialty,
      shift: form.shift,
      section: form.section.trim().toUpperCase(),
      subjectCode: form.subjectCode.trim() || '[CÓD-EJEMPLO]',
      subjectName: form.subjectName.trim(),
      teacher: form.teacher.trim(),
      day: form.day,
      startTime: form.startTime,
      endTime: form.endTime,
      classroom: form.classroom.trim(),
    };

    if (editingId) {
      onUpdateEntry({ id: editingId, ...payload });
      setEditingId(null);
    } else {
      onAddEntry(payload);
    }
    setForm(EMPTY_FORM);
  };

  const startEdit = (entry: ScheduleEntry) => {
    setEditingId(entry.id);
    setFormError(null);
    setForm({
      quarter: entry.quarter,
      specialty: entry.specialty,
      shift: entry.shift,
      section: entry.section,
      subjectCode: entry.subjectCode,
      subjectName: entry.subjectName,
      teacher: entry.teacher,
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      classroom: entry.classroom,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormError(null);
    setForm(EMPTY_FORM);
  };

  const handleCopyTsv = async () => {
    try {
      await navigator.clipboard.writeText(buildScheduleTSV(filteredEntries));
      setCopiedTsv(true);
      setTimeout(() => setCopiedTsv(false), 2200);
    } catch {
      setCopiedTsv(false);
    }
  };

  const handleDownloadCsv = () => {
    const csv = buildScheduleCSV(filteredEntries);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'carga-academica-iutirla-puerto-ordaz.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="no-print flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#8B0000]">
            Planificación Trimestral · Control de Carga Docente y Aulas
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Gestor de Horarios y Carga Académica
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl">
            Asigne asignaturas, docentes y aulas por turno. El sistema detecta automáticamente
            solapamientos por docente, aula o sección en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyTsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            {copiedTsv ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                Copiado para Excel
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copiar tabla (TSV)
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#8B0000] rounded-lg hover:bg-[#6E0000] transition-colors whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir cartelera
          </button>
        </div>
      </div>

      {/* Alertas Automáticas de Cruce */}
      <section className="no-print" aria-live="polite">
        {conflicts.length > 0 ? (
          <div className="bg-[#FDF2F2] border border-[#DC2626]/30 rounded-lg p-4 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[#DC2626] font-semibold text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {conflicts.length} cruce(s) de horario detectado(s) en la carga académica
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOnlyConflicts((prev) => !prev)}
                className="text-xs font-medium text-[#8B0000] underline self-start sm:self-auto whitespace-nowrap"
              >
                {onlyConflicts ? 'Mostrar todos los bloques' : 'Filtrar solo bloques en conflicto'}
              </button>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-800">
              {conflicts.map((conflict) => (
                <li key={conflict.id} className="flex items-start gap-2">
                  <span className="font-semibold text-[#DC2626] shrink-0">
                    [{conflict.type}]
                  </span>
                  <span>{conflict.description}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-2.5 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span>
              Validación horaria sin conflictos: no se registran cruces de docente, aula ni sección
              en los bloques activos.
            </span>
          </div>
        )}
      </section>

      {/* Formulario de Asignación */}
      <form
        onSubmit={handleSubmit}
        className="no-print bg-white border border-slate-200 rounded-lg p-5 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-semibold text-slate-900">
            {editingId ? 'Editar Bloque de Carga Académica' : 'Registrar Nuevo Bloque Horario'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <X className="w-3.5 h-3.5" />
              Cancelar edición
            </button>
          )}
        </div>

        {formError && (
          <p className="text-xs font-medium text-[#DC2626] bg-[#FDF2F2] border border-[#DC2626]/20 rounded-md px-3 py-2">
            {formError}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Trimestre</label>
            <input
              type="text"
              value={form.quarter}
              onChange={(e) => setForm({ ...form, quarter: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Especialidad</label>
            <select
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value as Specialty })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
            >
              {SPECIALTIES.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Turno</label>
            <select
              value={form.shift}
              onChange={(e) => setForm({ ...form, shift: e.target.value as Shift })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
            >
              {SHIFTS.map((sh) => (
                <option key={sh} value={sh}>
                  {sh}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Sección</label>
            <input
              type="text"
              placeholder="Ej. INF-402"
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Código Asignatura
            </label>
            <input
              type="text"
              value={form.subjectCode}
              onChange={(e) => setForm({ ...form, subjectCode: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">Asignatura</label>
            <input
              type="text"
              placeholder="Nombre completo de la unidad curricular"
              value={form.subjectName}
              onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Docente Asignado
            </label>
            <input
              type="text"
              placeholder="Prof. [NOMBRE]"
              value={form.teacher}
              onChange={(e) => setForm({ ...form, teacher: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Día</label>
            <select
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value as DayOfWeek })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Inicio</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Fin</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Aula / Laboratorio
            </label>
            <input
              type="text"
              placeholder="Ej. Lab. Informática 1"
              value={form.classroom}
              onChange={(e) => setForm({ ...form, classroom: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#8B0000] rounded-lg hover:bg-[#6E0000] transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              {editingId ? 'Guardar cambios' : 'Agregar a carga'}
            </button>
          </div>
        </div>
      </form>

      {/* Filtros y Tabla */}
      <div className="print-only-container bg-white border border-slate-200 rounded-lg overflow-hidden">
        {/* Encabezado solo visible al imprimir cartelera */}
        <div className="hidden print:flex items-center gap-4 p-4 border-b-2 border-[#8B0000]">
          <InstitutionalLogo className="w-12 h-12" />
          <div>
            <p className="text-xs font-bold text-[#8B0000]">
              IUTIRLA — EXTENSIÓN PUERTO ORDAZ · CARTELERA DE HORARIOS Y CARGA ACADÉMICA
            </p>
            <p className="text-[11px] text-slate-600">
              Especialidad: {specialtyFilter} · Turno: {shiftFilter} · Trimestre: {quarterFilter}
            </p>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="no-print p-4 border-b border-slate-200 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar docente, materia o aula..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
            />
          </div>

          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value as Specialty | 'Todas')}
            aria-label="Filtrar por especialidad"
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#8B0000]"
          >
            <option value="Todas">Especialidad: Todas</option>
            {SPECIALTIES.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>

          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value as Shift | 'Todos')}
            aria-label="Filtrar por turno"
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#8B0000]"
          >
            <option value="Todos">Turno: Todos</option>
            {SHIFTS.map((sh) => (
              <option key={sh} value={sh}>
                {sh}
              </option>
            ))}
          </select>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            aria-label="Filtrar por sección"
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#8B0000]"
          >
            <option value="Todas">Sección: Todas</option>
            {availableSections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>

          <select
            value={quarterFilter}
            onChange={(e) => setQuarterFilter(e.target.value)}
            aria-label="Filtrar por trimestre"
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#8B0000]"
          >
            <option value="Todos">Trimestre: Todos</option>
            {availableQuarters.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>

        {/* Tabla Limpia de Carga Horaria */}
        {filteredEntries.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-sm font-medium text-slate-900">
              No hay bloques horarios que coincidan con los filtros seleccionados.
            </p>
            <p className="text-xs text-slate-500">
              Ajuste los filtros superiores o registre un nuevo bloque en el formulario.
            </p>
            <button
              type="button"
              onClick={() => {
                setSpecialtyFilter('Todas');
                setShiftFilter('Todos');
                setQuarterFilter('Todos');
                setSectionFilter('Todas');
                setSearchQuery('');
                setOnlyConflicts(false);
              }}
              className="mt-2 px-3.5 py-1.5 text-xs font-medium text-[#8B0000] border border-[#8B0000]/30 rounded-lg hover:bg-[#FDF2F2]"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-3">Sección / Turno</th>
                  <th className="py-3 px-3">Especialidad</th>
                  <th className="py-3 px-3">Asignatura</th>
                  <th className="py-3 px-3">Docente</th>
                  <th className="py-3 px-3">Día y Bloque</th>
                  <th className="py-3 px-3">Aula</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="no-print py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEntries.map((entry) => {
                  const hasConflict = conflictingEntryIds.has(entry.id);
                  return (
                    <tr
                      key={entry.id}
                      className={
                        hasConflict
                          ? 'bg-[#FDF2F2]/70 hover:bg-[#FDF2F2]'
                          : 'hover:bg-slate-50/80 transition-colors'
                      }
                    >
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono font-semibold text-slate-900">
                          {entry.section}
                        </span>
                        <span className="block text-[11px] text-slate-500">{entry.shift}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        <span>{entry.specialty}</span>
                        <span className="block text-[11px] text-slate-400 font-mono">
                          {entry.quarter}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-900 block">
                          {entry.subjectName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          {entry.subjectCode}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-800">{entry.teacher}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-medium text-slate-900 block">{entry.day}</span>
                        <span className="font-mono tabular-nums text-slate-600">
                          {entry.startTime} - {entry.endTime}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                        {entry.classroom}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {hasConflict ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#DC2626]">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            Cruce detectado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-medium text-[#16A34A]">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            Sin cruce
                          </span>
                        )}
                      </td>
                      <td className="no-print py-3 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(entry)}
                            title="Editar bloque"
                            aria-label={`Editar ${entry.subjectName}`}
                            className="p-1.5 text-slate-600 hover:text-[#8B0000] hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteEntry(entry.id)}
                            title="Eliminar bloque"
                            aria-label={`Eliminar ${entry.subjectName}`}
                            className="p-1.5 text-slate-600 hover:text-[#DC2626] hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
