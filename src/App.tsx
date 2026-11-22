import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock,
  FileText,
  LayoutDashboard,
  Menu,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { AssistantModule } from './components/AssistantModule';
import { BulletinProceduresModule } from './components/BulletinProceduresModule';
import { DashboardModule } from './components/DashboardModule';
import { DocumentsModule } from './components/DocumentsModule';
import { InstitutionalLogo } from './components/InstitutionalMedia';
import { SchedulesModule } from './components/SchedulesModule';
import {
  DEFAULT_QUARTER,
  DOCUMENT_TEMPLATES,
  INITIAL_CALENDAR_MILESTONES,
  INITIAL_NOTICES,
  INITIAL_SCHEDULES,
  STUDENT_PROCEDURES,
} from './data/initialData';
import type {
  BulletinNotice,
  CalendarMilestone,
  ChatMessage,
  ModuleId,
  OfficialDocumentDraft,
  ScheduleEntry,
  Specialty,
  StudentProcedure,
} from './types/academic';
import { detectScheduleConflicts } from './utils/scheduleConflicts';

const STORAGE_KEYS = {
  schedules: 'iutirla_pzo_schedules_v1',
  milestones: 'iutirla_pzo_milestones_v1',
  notices: 'iutirla_pzo_notices_v1',
  draft: 'iutirla_pzo_doc_draft_v1',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const DEFAULT_DRAFT: OfficialDocumentDraft = {
  ...DOCUMENT_TEMPLATES.Memorando,
  cityAndDate: 'Puerto Ordaz, Estado Bolívar, [FECHA]',
};

const NAV_ITEMS: Array<{
  id: ModuleId;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
  { id: 'documents', label: 'Documentos Oficiales', icon: FileText },
  { id: 'schedules', label: 'Horarios y Carga', icon: Clock },
  { id: 'bulletin', label: 'Cartelera y Trámites', icon: CalendarDays },
  { id: 'assistant', label: 'Asistente IA', icon: Sparkles },
];

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [schedules, setSchedules] = useState<ScheduleEntry[]>(() =>
    readStorage(STORAGE_KEYS.schedules, INITIAL_SCHEDULES),
  );
  const [milestones, setMilestones] = useState<CalendarMilestone[]>(() =>
    readStorage(STORAGE_KEYS.milestones, INITIAL_CALENDAR_MILESTONES),
  );
  const [notices, setNotices] = useState<BulletinNotice[]>(() =>
    readStorage(STORAGE_KEYS.notices, INITIAL_NOTICES),
  );
  const [docDraft, setDocDraft] = useState<OfficialDocumentDraft>(() =>
    readStorage(STORAGE_KEYS.draft, DEFAULT_DRAFT),
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [scheduleSpecialtyFilter, setScheduleSpecialtyFilter] = useState<
    Specialty | 'Todas'
  >('Todas');

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(schedules));
    } catch {
      // ignore storage quota issues
    }
  }, [schedules]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.milestones, JSON.stringify(milestones));
    } catch {
      // ignore storage quota issues
    }
  }, [milestones]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.notices, JSON.stringify(notices));
    } catch {
      // ignore storage quota issues
    }
  }, [notices]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(docDraft));
    } catch {
      // ignore storage quota issues
    }
  }, [docDraft]);

  const { conflicts, conflictingEntryIds } = useMemo(
    () => detectScheduleConflicts(schedules),
    [schedules],
  );

  const workspaceContext = useMemo(() => {
    const sectionsCount = new Set(schedules.map((s) => `${s.specialty}-${s.section}`)).size;
    const teachersCount = new Set(schedules.map((s) => s.teacher.trim()).filter(Boolean)).size;
    return [
      `Período configurado: ${DEFAULT_QUARTER}`,
      `Bloques horarios registrados: ${schedules.length} (${sectionsCount} secciones activas, ${teachersCount} docentes asignados).`,
      `Cruces horarios detectados actualmente: ${conflicts.length}.`,
      `Avisos activos en cartelera: ${notices.length}.`,
    ].join('\n');
  }, [schedules, conflicts.length, notices.length]);

  const handleNavigate = (module: ModuleId) => {
    if (module !== 'schedules') {
      setScheduleSpecialtyFilter('Todas');
    }
    setActiveModule(module);
    setMobileMenuOpen(false);
  };

  const handleInspectSpecialtySchedule = (specialty: Specialty) => {
    setScheduleSpecialtyFilter(specialty);
    setActiveModule('schedules');
    setMobileMenuOpen(false);
  };

  const handleAddSchedule = (entry: Omit<ScheduleEntry, 'id'>) => {
    setSchedules((prev) => [...prev, { id: `sch-${Date.now()}`, ...entry }]);
  };

  const handleUpdateSchedule = (updated: ScheduleEntry) => {
    setSchedules((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateMilestone = (updated: CalendarMilestone) => {
    setMilestones((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleAddNotice = (notice: Omit<BulletinNotice, 'id'>) => {
    setNotices((prev) => [{ id: `not-${Date.now()}`, ...notice }, ...prev]);
  };

  const handleDeleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  const handleCreateDocFromProcedure = (procedure: StudentProcedure) => {
    const requirementsBullets = procedure.requirements.map((r) => `- ${r}`).join('\n');
    const approvalsLine = procedure.approvals.join(', ');

    setDocDraft({
      docType: 'Circular',
      correlative: 'CIRCULAR N° [EJEMPLO]',
      cityAndDate: 'Puerto Ordaz, Estado Bolívar, [FECHA]',
      senderOffice: 'Dirección / Coordinación Académica — Extensión Puerto Ordaz',
      recipient: 'Personal Coordinador y Estudiantado del IUTIRLA Extensión Puerto Ordaz',
      subject: `Lineamientos operativos para el trámite: ${procedure.title}`,
      body: `Se informa a la comunidad estudiantil y coordinaciones de carrera los lineamientos vigentes para el trámite de ${procedure.title} (${procedure.category}):

${procedure.description}

RECAUDOS OBLIGATORIOS:
${requirementsBullets}

LAPSO OPERATIVO: ${procedure.timeframe}
INSTANCIAS DE APROBACIÓN: ${approvalsLine}

Los interesados deberán consignar su expediente completo ante las oficinas correspondientes dentro del período señalado, sujeto a verificación administrativa y académica.`,
      signerName: '[NOMBRE DE LA AUTORIDAD]',
      signerRole: 'Dirección / Coordinación Académica — Extensión Puerto Ordaz',
      isConfidential: false,
    });
    setActiveModule('documents');
  };

  const handleSendAssistantDraft = (partial: Partial<OfficialDocumentDraft>) => {
    setDocDraft((prev) => ({
      ...prev,
      ...partial,
      cityAndDate: prev.cityAndDate || 'Puerto Ordaz, Estado Bolívar, [FECHA]',
    }));
    setActiveModule('documents');
  };

  const handleResetWorkspaceData = () => {
    setSchedules(INITIAL_SCHEDULES);
    setMilestones(INITIAL_CALENDAR_MILESTONES);
    setNotices(INITIAL_NOTICES);
    setDocDraft(DEFAULT_DRAFT);
  };

  const currentNavLabel =
    NAV_ITEMS.find((item) => item.id === activeModule)?.label ?? 'Panel Principal';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Backdrop móvil */}
      {mobileMenuOpen && (
        <div
          className="no-print fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Barra Lateral Todo-en-Uno */}
      <aside
        className={`no-print fixed lg:sticky top-0 left-0 z-40 h-screen w-[264px] shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col min-h-0">
          {/* Identidad en Sidebar */}
          <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <InstitutionalLogo className="w-10 h-10" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#8B0000] truncate">
                  IUTIRLA · Puerto Ordaz
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  Dirección y Coordinación
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-md"
              aria-label="Cerrar menú lateral"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navegación Principal */}
          <nav className="p-3 space-y-1 overflow-y-auto" aria-label="Módulos del sistema">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#8B0000] text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>

                  {item.id === 'schedules' && conflicts.length > 0 && (
                    <span
                      className={`text-[11px] font-mono tabular-nums font-semibold ${
                        isActive ? 'text-[#FAF4E1]' : 'text-[#DC2626]'
                      }`}
                    >
                      {conflicts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Pie Institucional del Menú */}
        <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50/70">
          <div className="space-y-0.5 text-[11px] text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-700">
              Suite de Gestión Académica
            </p>
            <p>Diseñada originalmente por Leonardo Salazar</p>
            <p>Ciudad Guayana, Estado Bolívar</p>
          </div>
          <button
            type="button"
            onClick={handleResetWorkspaceData}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Restablecer datos base
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Barra Superior de Contrato 3 Zonas */}
        <header className="no-print sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-md"
              aria-label="Abrir menú lateral"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
              <span className="font-medium text-slate-500 hidden sm:inline whitespace-nowrap">
                Suite IUTIRLA PZO
              </span>
              <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <h1 className="font-semibold text-slate-900 truncate">{currentNavLabel}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden md:inline text-xs font-mono text-slate-500 whitespace-nowrap">
              {DEFAULT_QUARTER}
            </span>
            {activeModule !== 'assistant' && (
              <button
                type="button"
                onClick={() => handleNavigate('assistant')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#8B0000] rounded-lg hover:bg-[#6E0000] transition-colors whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Asistente IA
              </button>
            )}
          </div>
        </header>

        {/* Contenido Activo */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1320px] w-full mx-auto">
          {activeModule === 'dashboard' && (
            <DashboardModule
              schedules={schedules}
              conflicts={conflicts}
              notices={notices}
              milestones={milestones}
              proceduresCount={STUDENT_PROCEDURES.length}
              activeQuarter={DEFAULT_QUARTER}
              onNavigate={handleNavigate}
              onInspectSpecialtySchedule={handleInspectSpecialtySchedule}
            />
          )}

          {activeModule === 'documents' && (
            <DocumentsModule draft={docDraft} onChangeDraft={setDocDraft} />
          )}

          {activeModule === 'schedules' && (
            <SchedulesModule
              key={scheduleSpecialtyFilter}
              entries={schedules}
              conflicts={conflicts}
              conflictingEntryIds={conflictingEntryIds}
              initialSpecialtyFilter={scheduleSpecialtyFilter}
              onAddEntry={handleAddSchedule}
              onUpdateEntry={handleUpdateSchedule}
              onDeleteEntry={handleDeleteSchedule}
            />
          )}

          {activeModule === 'bulletin' && (
            <BulletinProceduresModule
              milestones={milestones}
              notices={notices}
              onUpdateMilestone={handleUpdateMilestone}
              onAddNotice={handleAddNotice}
              onDeleteNotice={handleDeleteNotice}
              onCreateDocumentFromProcedure={handleCreateDocFromProcedure}
            />
          )}

          {activeModule === 'assistant' && (
            <AssistantModule
              messages={chatMessages}
              workspaceContext={workspaceContext}
              onUpdateMessages={setChatMessages}
              onSendDraftToDocuments={handleSendAssistantDraft}
            />
          )}
        </main>
      </div>
    </div>
  );
}
