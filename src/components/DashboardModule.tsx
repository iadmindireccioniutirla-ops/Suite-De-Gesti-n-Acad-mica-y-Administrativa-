import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Sparkles,
  Users,
} from 'lucide-react';
import { SHIFTS, SPECIALTIES } from '../data/initialData';
import type {
  BulletinNotice,
  CalendarMilestone,
  ModuleId,
  ScheduleConflict,
  ScheduleEntry,
  Specialty,
} from '../types/academic';
import { InstitutionalBanner } from './InstitutionalMedia';

interface DashboardModuleProps {
  schedules: ScheduleEntry[];
  conflicts: ScheduleConflict[];
  notices: BulletinNotice[];
  milestones: CalendarMilestone[];
  proceduresCount: number;
  activeQuarter: string;
  onNavigate: (module: ModuleId) => void;
  onInspectSpecialtySchedule: (specialty: Specialty) => void;
}

export function DashboardModule({
  schedules,
  conflicts,
  notices,
  milestones,
  proceduresCount,
  activeQuarter,
  onNavigate,
  onInspectSpecialtySchedule,
}: DashboardModuleProps) {
  const uniqueSections = new Set(schedules.map((s) => `${s.specialty}-${s.section}`));
  const uniqueTeachers = new Set(schedules.map((s) => s.teacher.trim()).filter(Boolean));
  const prioritizedNotices = notices.filter((n) => n.priority === 'Prioritario').length;

  const kpis = [
    {
      label: 'Secciones activas',
      value: uniqueSections.size,
      detail: `${schedules.length} bloques asignados en carga`,
      icon: BookOpen,
      actionLabel: 'Ver horarios',
      target: 'schedules' as ModuleId,
    },
    {
      label: 'Docentes asignados',
      value: uniqueTeachers.size,
      detail:
        conflicts.length > 0
          ? `${conflicts.length} cruce(s) detectado(s)`
          : 'Sin cruces de horario',
      icon: Users,
      alert: conflicts.length > 0,
      actionLabel: 'Validar carga',
      target: 'schedules' as ModuleId,
    },
    {
      label: 'Trámites en guía',
      value: proceduresCount,
      detail: 'Control de estudios y requisitos de egreso',
      icon: ClipboardCheck,
      actionLabel: 'Abrir guía',
      target: 'bulletin' as ModuleId,
    },
    {
      label: 'Avisos del trimestre',
      value: notices.length,
      detail: `${prioritizedNotices} prioritario(s) · ${milestones.length} hitos`,
      icon: Calendar,
      actionLabel: 'Ir a cartelera',
      target: 'bulletin' as ModuleId,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Banner Institucional */}
      <section className="space-y-4">
        <InstitutionalBanner />
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-[#8B0000]">
              Dirección y Coordinación Académica · Extensión Puerto Ordaz
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 [text-wrap:balance]">
              Resumen Ejecutivo Operativo
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Ciudad Guayana, Estado Bolívar</span>
              <span aria-hidden="true">·</span>
              <span>Período: {activeQuarter}</span>
              <span aria-hidden="true">·</span>
              <span>Turnos Diurno, Nocturno y Sabatino</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('documents')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <FileText className="w-4 h-4 text-[#8B0000]" />
              Redactar documento
            </button>
            <button
              type="button"
              onClick={() => onNavigate('assistant')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#8B0000] rounded-lg hover:bg-[#6E0000] transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              Consultar Asistente IA
            </button>
          </div>
        </div>
      </section>

      {/* Indicadores Operativos */}
      <section aria-label="Indicadores operativos del trimestre">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      item.alert ? 'text-[#DC2626]' : 'text-[#8B0000]'
                    }`}
                  />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
                    {item.value}
                  </p>
                  <p
                    className={`mt-1 text-xs flex items-center gap-1.5 ${
                      item.alert ? 'text-[#DC2626] font-medium' : 'text-slate-500'
                    }`}
                  >
                    {item.alert ? (
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    ) : item.label === 'Docentes asignados' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    ) : null}
                    <span>{item.detail}</span>
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onNavigate(item.target)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8B0000] hover:text-[#6E0000] transition-colors whitespace-nowrap"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Matriz de Especialidades y Turnos */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Especialidades Técnicas y Organización por Turnos
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribución trimestral de bloques horarios registrados por especialidad y modalidad
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('schedules')}
              className="text-xs font-medium text-[#8B0000] hover:underline whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              Administrar carga completa
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Especialidad Técnica (TSU)</th>
                  {SHIFTS.map((shift) => (
                    <th key={shift} className="py-3 px-3 text-right">
                      {shift}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-right">Secciones</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {SPECIALTIES.map((spec) => {
                  const specEntries = schedules.filter((s) => s.specialty === spec);
                  const specSections = new Set(specEntries.map((s) => s.section)).size;
                  return (
                    <tr key={spec} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">{spec}</td>
                      {SHIFTS.map((shift) => {
                        const count = specEntries.filter((s) => s.shift === shift).length;
                        return (
                          <td
                            key={shift}
                            className="py-3 px-3 text-right font-mono tabular-nums text-slate-600"
                          >
                            {count}
                          </td>
                        );
                      })}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {specSections}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onInspectSpecialtySchedule(spec)}
                          className="text-xs font-medium text-[#8B0000] hover:text-[#6E0000] hover:underline whitespace-nowrap"
                        >
                          Filtrar horario
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Estado de Control Operativo y Alertas */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-900">
                Estado de Validación Horaria
              </h3>
              <span
                className={`text-xs font-medium inline-flex items-center gap-1 ${
                  conflicts.length > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'
                }`}
              >
                {conflicts.length > 0 ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Requiere atención
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Operativo
                  </>
                )}
              </span>
            </div>

            {conflicts.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Se han detectado cruces activos en la carga académica del trimestre. Resuélvalos en
                  el módulo de horarios antes de publicar las carteleras.
                </p>
                <ul className="space-y-2 border-t border-slate-100 pt-3">
                  {conflicts.slice(0, 3).map((c) => (
                    <li key={c.id} className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-semibold text-[#DC2626]">Cruce de {c.type}:</span>{' '}
                      {c.description}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => onNavigate('schedules')}
                  className="w-full py-2 px-4 text-xs font-medium text-white bg-[#DC2626] rounded-lg hover:bg-red-700 transition-colors"
                >
                  Resolver conflictos ahora
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Todos los bloques registrados en los turnos Diurno, Nocturno y Sabatino se
                  encuentran validados sin solapamientos de docente, aula ni sección.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('schedules')}
                  className="w-full py-2 px-4 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Revisar tabla de horarios
                </button>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
            <h3 className="text-base font-semibold text-slate-900">
              Próximos Avisos de Cartelera
            </h3>
            <ul className="divide-y divide-slate-100">
              {notices.slice(0, 3).map((notice) => (
                <li key={notice.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
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
                    <span>{notice.audience}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{notice.dateLabel}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 leading-snug">
                    {notice.title}
                  </p>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => onNavigate('bulletin')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8B0000] hover:underline pt-1"
            >
              <span>Ver cronograma y cartelera completa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
