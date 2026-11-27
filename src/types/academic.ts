export type ModuleId =
  | 'dashboard'
  | 'documents'
  | 'schedules'
  | 'bulletin'
  | 'control-studies'
  | 'assistant';

export type Specialty =
  | 'Informática'
  | 'Administración'
  | 'Relaciones Industriales'
  | 'Publicidad y Mercadeo'
  | 'Turismo';

export type Shift = 'Diurno' | 'Nocturno' | 'Sabatino';

export type DayOfWeek =
  | 'Lunes'
  | 'Martes'
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sábado';

export interface ScheduleEntry {
  id: string;
  quarter: string;
  specialty: Specialty;
  shift: Shift;
  section: string;
  subjectCode: string;
  subjectName: string;
  teacher: string;
  day: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  classroom: string;
}

export type ConflictType = 'Docente' | 'Aula' | 'Sección';

export interface ScheduleConflict {
  id: string;
  type: ConflictType;
  entryAId: string;
  entryBId: string;
  day: DayOfWeek;
  quarter: string;
  overlapWindow: string;
  resourceName: string;
  description: string;
}

export type DocumentType =
  | 'Memorando'
  | 'Circular'
  | 'Oficio'
  | 'Acta de Reunión'
  | 'Informe de Gestión'
  | 'Comunicado';

export interface OfficialDocumentDraft {
  docType: DocumentType;
  correlative: string;
  cityAndDate: string;
  senderOffice: string;
  recipient: string;
  subject: string;
  body: string;
  signerName: string;
  signerRole: string;
  isConfidential: boolean;
}

export interface CalendarMilestone {
  id: string;
  phase: string;
  activity: string;
  dateLabel: string;
  responsible: string;
  status: 'Programado' | 'En curso' | 'Pendiente de fecha';
}

export interface BulletinNotice {
  id: string;
  title: string;
  audience: 'Docentes' | 'Estudiantes' | 'Toda la Comunidad';
  dateLabel: string;
  summary: string;
  priority: 'Ordinario' | 'Prioritario';
}

export interface StudentProcedure {
  id: string;
  title: string;
  category: 'Control de Estudios' | 'Requisitos de Egreso';
  description: string;
  requirements: string[];
  timeframe: string;
  prerequisites: string[];
  approvals: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  error?: boolean;
}
