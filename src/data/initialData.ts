import type {
  BulletinNotice,
  CalendarMilestone,
  DayOfWeek,
  DocumentType,
  OfficialDocumentDraft,
  ScheduleEntry,
  Shift,
  Specialty,
  StudentProcedure,
} from '../types/academic';

export const SPECIALTIES: Specialty[] = [
  'Informática',
  'Administración',
  'Relaciones Industriales',
  'Publicidad y Mercadeo',
  'Turismo',
];

export const SHIFTS: Shift[] = ['Diurno', 'Nocturno', 'Sabatino'];

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export const DEFAULT_QUARTER = '[TRIMESTRE ACTUAL - EJEMPLO]';

export const INITIAL_SCHEDULES: ScheduleEntry[] = [
  {
    id: 'sch-1',
    quarter: DEFAULT_QUARTER,
    specialty: 'Informática',
    shift: 'Diurno',
    section: 'INF-401',
    subjectCode: '[INF-401-EJEMPLO]',
    subjectName: 'Inteligencia Artificial',
    teacher: 'Prof. Germán Delgadillo',
    day: 'Lunes',
    startTime: '07:30',
    endTime: '09:45',
    classroom: 'Lab. Informática 1',
  },
  {
    id: 'sch-2',
    quarter: DEFAULT_QUARTER,
    specialty: 'Informática',
    shift: 'Diurno',
    section: 'INF-302',
    subjectCode: '[INF-302-EJEMPLO]',
    subjectName: 'Bases de Datos II',
    teacher: 'Prof. Germán Delgadillo',
    day: 'Lunes',
    startTime: '09:00',
    endTime: '11:15',
    classroom: 'Lab. Informática 1',
  },
  {
    id: 'sch-3',
    quarter: DEFAULT_QUARTER,
    specialty: 'Administración',
    shift: 'Nocturno',
    section: 'ADM-201',
    subjectCode: '[ADM-201-EJEMPLO]',
    subjectName: 'Contabilidad de Costos I',
    teacher: 'Lcda. [DOCENTE EJEMPLO A]',
    day: 'Martes',
    startTime: '18:00',
    endTime: '20:15',
    classroom: 'Aula 04',
  },
  {
    id: 'sch-4',
    quarter: DEFAULT_QUARTER,
    specialty: 'Relaciones Industriales',
    shift: 'Nocturno',
    section: 'RI-301',
    subjectCode: '[RI-301-EJEMPLO]',
    subjectName: 'Legislación Laboral Venezolana',
    teacher: 'Abg. [DOCENTE EJEMPLO B]',
    day: 'Miércoles',
    startTime: '18:00',
    endTime: '20:15',
    classroom: 'Aula 07',
  },
  {
    id: 'sch-5',
    quarter: DEFAULT_QUARTER,
    specialty: 'Publicidad y Mercadeo',
    shift: 'Diurno',
    section: 'PM-202',
    subjectCode: '[PM-202-EJEMPLO]',
    subjectName: 'Investigación de Mercados',
    teacher: 'Lcdo. [DOCENTE EJEMPLO C]',
    day: 'Jueves',
    startTime: '08:00',
    endTime: '10:15',
    classroom: 'Aula 11',
  },
  {
    id: 'sch-6',
    quarter: DEFAULT_QUARTER,
    specialty: 'Turismo',
    shift: 'Sabatino',
    section: 'TUR-101',
    subjectCode: '[TUR-101-EJEMPLO]',
    subjectName: 'Geografía Turística Nacional',
    teacher: 'MSc. [DOCENTE EJEMPLO D]',
    day: 'Sábado',
    startTime: '08:00',
    endTime: '11:00',
    classroom: 'Aula 02',
  },
  {
    id: 'sch-7',
    quarter: DEFAULT_QUARTER,
    specialty: 'Informática',
    shift: 'Sabatino',
    section: 'INF-501',
    subjectCode: '[INF-501-EJEMPLO]',
    subjectName: 'Seminario de Trabajo Especial de Grado',
    teacher: 'Ing. [DOCENTE EJEMPLO E]',
    day: 'Sábado',
    startTime: '11:15',
    endTime: '13:30',
    classroom: 'Lab. Informática 2',
  },
];

export const INITIAL_CALENDAR_MILESTONES: CalendarMilestone[] = [
  {
    id: 'cal-1',
    phase: 'Apertura Administrativa',
    activity: 'Recepción de cargas horarias y asignación definitiva de aulas por turno',
    dateLabel: '[FECHA INICIO - EJEMPLO]',
    responsible: 'Coordinación Académica',
    status: 'Pendiente de fecha',
  },
  {
    id: 'cal-2',
    phase: 'Inicio de Actividades',
    activity: 'Inicio formal de clases del período trimestral (Diurno, Nocturno y Sabatino)',
    dateLabel: '[FECHA - EJEMPLO]',
    responsible: 'Dirección de Extensión / Coordinaciones',
    status: 'Programado',
  },
  {
    id: 'cal-3',
    phase: 'Control de Estudios',
    activity: 'Período ordinario de Adición y Retiro de asignaturas',
    dateLabel: '[SEMANA 1 A SEMANA 2 - EJEMPLO]',
    responsible: 'Control de Estudios',
    status: 'Pendiente de fecha',
  },
  {
    id: 'cal-4',
    phase: 'Primer Corte Evaluativo',
    activity: 'Aplicación de evaluaciones del 1er corte y carga de calificaciones parciales',
    dateLabel: '[SEMANA 4 - EJEMPLO]',
    responsible: 'Personal Docente',
    status: 'Pendiente de fecha',
  },
  {
    id: 'cal-5',
    phase: 'Segundo Corte Evaluativo',
    activity: 'Evaluaciones del 2do corte y seguimiento de rendimiento estudiantil',
    dateLabel: '[SEMANA 8 - EJEMPLO]',
    responsible: 'Personal Docente / Coordinación',
    status: 'Pendiente de fecha',
  },
  {
    id: 'cal-6',
    phase: 'Tercer Corte Evaluativo',
    activity: 'Evaluaciones finales y consolidación de notas acumuladas',
    dateLabel: '[SEMANA 11 - EJEMPLO]',
    responsible: 'Personal Docente',
    status: 'Pendiente de fecha',
  },
  {
    id: 'cal-7',
    phase: 'Recuperación y Diferidos',
    activity: 'Semana de pruebas de recuperación, diferidos y revisión de actas',
    dateLabel: '[SEMANA 12 - EJEMPLO]',
    responsible: 'Coordinación Académica / Docentes',
    status: 'Pendiente de fecha',
  },
  {
    id: 'cal-8',
    phase: 'Cierre de Trimestre',
    activity: 'Consignación de actas definitivas y cierre administrativo del trimestre',
    dateLabel: '[FECHA CIERRE - EJEMPLO]',
    responsible: 'Control de Estudios / Dirección',
    status: 'Pendiente de fecha',
  },
];

export const INITIAL_NOTICES: BulletinNotice[] = [
  {
    id: 'not-1',
    title: 'Consignación de Planificación Trimestral y Cargas Horarias',
    audience: 'Docentes',
    dateLabel: '[FECHA - EJEMPLO]',
    summary:
      'Se recuerda a los profesores adscritos a las especialidades de la Extensión Puerto Ordaz entregar su planificación de evaluación antes del inicio del primer corte según los lineamientos de Coordinación Académica.',
    priority: 'Prioritario',
  },
  {
    id: 'not-2',
    title: 'Recepción de Expedientes para Servicio Comunitario y Pasantías',
    audience: 'Estudiantes',
    dateLabel: '[FECHA - EJEMPLO]',
    summary:
      'Los bachilleres cursantes de trimestres superiores deben verificar sus unidades de crédito aprobadas y solvencias administrativas antes de formalizar su postulación ante la Coordinación respectiva.',
    priority: 'Ordinario',
  },
  {
    id: 'not-3',
    title: 'Uso Regular de Laboratorios de Informática y Aulas Asignadas',
    audience: 'Toda la Comunidad',
    dateLabel: '[FECHA - EJEMPLO]',
    summary:
      'Cualquier cambio eventual de aula o bloque horario debe ser autorizado previamente por la Coordinación Académica para evitar solapamientos en los turnos Diurno, Nocturno y Sabatino.',
    priority: 'Ordinario',
  },
];

export const STUDENT_PROCEDURES: StudentProcedure[] = [
  {
    id: 'proc-inscripcion',
    title: 'Inscripciones (Nuevo Ingreso y Regulares)',
    category: 'Control de Estudios',
    description:
      'Formalización de matrícula académica por período trimestral en las especialidades técnicas de la Extensión Puerto Ordaz.',
    requirements: [
      'Planilla de inscripción generada por Control de Estudios.',
      'Copia legible de la Cédula de Identidad vigente.',
      'Para nuevo ingreso: Título de Bachiller autenticado, notas certificadas y partida de nacimiento.',
      'Comprobante de solvencia administrativa del trimestre.',
    ],
    timeframe: '[LAPSO DE INSCRIPCIÓN SEGÚN CALENDARIO OFICIAL - EJEMPLO]',
    prerequisites: ['No poseer bloqueos administrativos o retención documental pendiente.'],
    approvals: ['Control de Estudios', 'Caja / Administración'],
  },
  {
    id: 'proc-adicion-retiro',
    title: 'Adición y Retiro de Asignaturas',
    category: 'Control de Estudios',
    description:
      'Ajuste excepcional de la carga académica inscrita dentro del lapso reglamentario de inicio del trimestre.',
    requirements: [
      'Planilla de solicitud de Adición y/o Retiro debidamente firmada.',
      'Copia del comprobante de inscripción vigente.',
      'Justificación académica o laboral en caso de cambio de turno/sección.',
    ],
    timeframe: '[PRIMERAS DOS SEMANAS DEL TRIMESTRE - EJEMPLO]',
    prerequisites: [
      'Cumplir con las prelaciones académicas de las asignaturas a adicionar.',
      'Disponibilidad de cupo y ausencia de choque de horario.',
    ],
    approvals: ['Coordinación de Especialidad', 'Control de Estudios'],
  },
  {
    id: 'proc-equivalencias',
    title: 'Equivalencias y Traslados',
    category: 'Control de Estudios',
    description:
      'Reconocimiento de unidades curriculares aprobadas en otra institución de educación superior o entre extensiones del IUTIRLA.',
    requirements: [
      'Carta de solicitud dirigida a la Dirección / Consejo Académico.',
      'Notas certificadas originales emitidas por la institución de origen.',
      'Programas sinópticos sellados y firmados de las asignaturas cursadas.',
      'Copia de la Cédula de Identidad y arancel administrativo vigente.',
    ],
    timeframe: '[RECEPCIÓN PREVIA AL INICIO DE TRIMESTRE - EJEMPLO]',
    prerequisites: ['Aprobación mínima reglamentaria en las asignaturas sometidas a estudio.'],
    approvals: ['Comisión de Equivalencias / Coordinación Académica', 'Dirección de Extensión'],
  },
  {
    id: 'proc-reingreso',
    title: 'Reingresos y Cambios de Turno',
    category: 'Control de Estudios',
    description:
      'Reincorporación de estudiantes inactivos o solicitud formal de cambio entre turnos Diurno, Nocturno o Sabatino.',
    requirements: [
      'Solicitud escrita dirigida a Control de Estudios y Coordinación Académica.',
      'Récord académico actualizado y copia de Cédula de Identidad.',
      'Constancia de trabajo (si solicita cambio al turno Nocturno o Sabatino).',
    ],
    timeframe: '[LAPSO PREVIO A INSCRIPCIONES ORDINARIAS - EJEMPLO]',
    prerequisites: [
      'Evaluación de vigencia del pensum de estudios.',
      'Solvencia administrativa al día.',
    ],
    approvals: ['Coordinación Académica', 'Control de Estudios'],
  },
  {
    id: 'proc-servicio-comunitario',
    title: 'Servicio Comunitario',
    category: 'Requisitos de Egreso',
    description:
      'Cumplimiento obligatorio de la Ley de Servicio Comunitario del Estudiante de Educación Superior (120 horas académicas en proyecto aprobado).',
    requirements: [
      'Planilla de inscripción al Servicio Comunitario y carta de postulación.',
      'Anteproyecto comunitario avalado por el tutor académico y la comunidad receptora.',
      'Registro de control de asistencia (120 horas) e informe final de ejecución.',
    ],
    timeframe: '[MÍNIMO 3 MESES DE EJECUCIÓN / CRONOGRAMA - EJEMPLO]',
    prerequisites: [
      'Haber aprobado al menos el 50% de las unidades de crédito de la carrera ([REVISAR REGLAMENTO INTERNO]).',
      'Aprobar el taller/inducción de Servicio Comunitario.',
    ],
    approvals: ['Coordinación de Servicio Comunitario', 'Tutor Académico'],
  },
  {
    id: 'proc-pasantias',
    title: 'Pasantías Profesionales',
    category: 'Requisitos de Egreso',
    description:
      'Práctica profesional supervisada en organizaciones públicas o privadas vinculadas a la especialidad técnica.',
    requirements: [
      'Carta de postulación emitida por la Coordinación de Pasantías.',
      'Carta de aceptación de la empresa con datos del tutor empresarial.',
      'Cronograma de actividades, evaluaciones periódicas e informe final de pasantías.',
    ],
    timeframe: '[DURACIÓN REGLAMENTARIA SEGÚN PENSUM - EJEMPLO]',
    prerequisites: [
      'Aprobación de las asignaturas de prelación profesional exigidas en el pensum.',
      'Solvencia de inscripción en el trimestre de pasantías.',
    ],
    approvals: ['Coordinación de Pasantías', 'Tutor Académico', 'Tutor Empresarial'],
  },
  {
    id: 'proc-teg',
    title: 'Trabajo Especial de Grado (TEG)',
    category: 'Requisitos de Egreso',
    description:
      'Investigación aplicada o proyecto tecnológico final conducente a la obtención del título de Técnico Superior Universitario (TSU).',
    requirements: [
      'Carta de aprobación del título y designación de tutor metodológico/contenido.',
      'Anteproyecto y tomo final del TEG conforme al Manual de Normas del IUTIRLA.',
      'Planilla de solvencia académica, administrativa y de biblioteca.',
      'Acta de veredicto suscrita por el jurado evaluador tras defensa pública.',
    ],
    timeframe: '[CRONOGRAMA DE DEFENSAS TRIMESTRALES - EJEMPLO]',
    prerequisites: [
      'Aprobación de Seminario / Metodología de la Investigación y carga curricular exigida.',
      'Servicio Comunitario culminado o en fase de cierre conforme al reglamento vigente.',
    ],
    approvals: ['Tutor de Contenido', 'Coordinación de Investigación / TEG', 'Jurado Evaluador'],
  },
];

export const DOCUMENT_TEMPLATES: Record<DocumentType, Omit<OfficialDocumentDraft, 'cityAndDate'>> = {
  Memorando: {
    docType: 'Memorando',
    correlative: 'IUTIRLA-PZO-DIR-[N° EJEMPLO]',
    senderOffice: 'Dirección / Coordinación Académica',
    recipient: '[NOMBRE Y CARGO DEL DESTINATARIO - EJEMPLO]',
    subject: 'Lineamientos para entrega de planificación trimestral y registro de calificaciones',
    body: `Por medio de la presente me dirijo a usted en la oportunidad de extenderle un cordial saludo institucional y, a la vez, solicitar la consignación de la planificación académica y plan de evaluación correspondiente al período [TRIMESTRE - EJEMPLO].

Dicha documentación deberá ser entregada en formato digital e impreso ante esta Coordinación Académica a más tardar el [FECHA LÍMITE - EJEMPLO], especificando ponderaciones por corte evaluativo y estrategias de recuperación, en cumplimiento de las normas internas de evaluación del Instituto.

Agradeciendo de antemano su receptividad y puntual cumplimiento en beneficio del adecuado desenvolvimiento académico de nuestra Extensión Puerto Ordaz.`,
    signerName: '[NOMBRE DE LA AUTORIDAD]',
    signerRole: 'Dirección / Coordinación Académica — Extensión Puerto Ordaz',
    isConfidential: false,
  },
  Circular: {
    docType: 'Circular',
    correlative: 'CIRCULAR N° [EJEMPLO]',
    senderOffice: 'Dirección de Extensión Puerto Ordaz',
    recipient: 'Personal Docente, Coordinadores de Especialidad y Estudiantado',
    subject: 'Normativa operativa para el desarrollo del período trimestral [EJEMPLO]',
    body: `Se informa a toda la comunidad universitaria del Instituto Universitario de Tecnología Industrial "Rodolfo Loero Arismendi" (IUTIRLA), Extensión Puerto Ordaz, las disposiciones generales vigentes para el período [TRIMESTRE - EJEMPLO]:

1. El cumplimiento estricto de los bloques horarios asignados en los turnos Diurno, Nocturno y Sabatino es obligatorio tanto para el cuerpo docente como para los cursantes.
2. Toda modificación eventual de aula o reprogramación de actividades evaluativas requiere visto bueno previo de la Coordinación Académica.
3. Los trámites de adición, retiro y solicitudes especiales deberán canalizarse exclusivamente por Control de Estudios dentro del lapso establecido en el cronograma oficial: [FECHAS - EJEMPLO].

Se exhorta a dar fiel cumplimiento a estas directrices para garantizar la excelencia operativa de la sede.`,
    signerName: '[NOMBRE DEL DIRECTOR(A) O COORDINADOR(A)]',
    signerRole: 'Dirección / Coordinación Académica — Extensión Puerto Ordaz',
    isConfidential: false,
  },
  Oficio: {
    docType: 'Oficio',
    correlative: 'OFICIO N° [EJEMPLO]',
    senderOffice: 'Dirección de Extensión Puerto Ordaz',
    recipient: '[AUTORIDAD O INSTITUCIÓN RECEPTORA - EJEMPLO]',
    subject: 'Remisión de información académica / Solicitud institucional',
    body: `Tengo el agrado de dirigirme a usted, en nombre del Instituto Universitario de Tecnología Industrial "Rodolfo Loero Arismendi" (IUTIRLA), Extensión Puerto Ordaz, con la finalidad de remitir / solicitar [DETALLE DEL REQUERIMIENTO - EJEMPLO], correspondiente al período académico [TRIMESTRE - EJEMPLO].

La presente comunicación tiene por objeto dar continuidad administrativa al expediente N° [N° DE EXPEDIENTE - EJEMPLO], asegurando la debida trazabilidad y respaldo institucional conforme a la normativa de educación superior vigente.

Sin otro particular al cual hacer referencia y reiterando nuestra disposición de colaboración interinstitucional, me suscribo de usted atentamente.`,
    signerName: '[NOMBRE DE LA AUTORIDAD]',
    signerRole: 'Dirección de Extensión — IUTIRLA Puerto Ordaz',
    isConfidential: false,
  },
  'Acta de Reunión': {
    docType: 'Acta de Reunión',
    correlative: 'ACTA N° [EJEMPLO]',
    senderOffice: 'Consejo Académico / Coordinación de Extensión',
    recipient: 'Miembros del Consejo Académico y Coordinaciones de Especialidad',
    subject: 'Acta de sesión ordinaria sobre planificación de carga docente y control académico',
    body: `En la ciudad de Puerto Ordaz, Estado Bolívar, siendo las [HORA - EJEMPLO] del día [FECHA - EJEMPLO], se reunieron en las instalaciones de la Extensión Puerto Ordaz del IUTIRLA los representantes de la Dirección y Coordinaciones Académicas con el propósito de tratar los siguientes puntos de agenda:

1. Revisión de la distribución de carga horaria docente en las especialidades de Informática, Administración, Relaciones Industriales, Publicidad y Mercadeo, y Turismo.
2. Validación de aulas disponibles y verificación de no superposición de horarios en los turnos Diurno, Nocturno y Sabatino.
3. Seguimiento de expedientes de Servicio Comunitario, Pasantías Profesionales y Trabajo Especial de Grado (TEG).

ACUERDOS ALCANZADOS:
- [ACUERDO 1 - EJEMPLO]: Consignar ajustes definitivos de horarios antes del [FECHA - EJEMPLO].
- [ACUERDO 2 - EJEMPLO]: Realizar corte de verificación administrativa de expedientes de egreso en la fecha pautada.

No habiendo otro punto que tratar, se da por concluida la sesión y firman los presentes en señal de conformidad.`,
    signerName: '[AUTORIDADES PRESENTES / SECRETARÍA DE ACTAS]',
    signerRole: 'Consejo Académico — Extensión Puerto Ordaz',
    isConfidential: false,
  },
  'Informe de Gestión': {
    docType: 'Informe de Gestión',
    correlative: 'INF-GEST-[EJEMPLO]',
    senderOffice: 'Coordinación Académica — Extensión Puerto Ordaz',
    recipient: 'Dirección Nacional / Dirección de Extensión',
    subject: 'Balance operativo trimestral de carga académica, secciones y trámites de egreso',
    body: `I. OBJETIVO DEL INFORME
Presentar el balance consolidado de la gestión académica y operativa de la Extensión Puerto Ordaz durante el período [TRIMESTRE - EJEMPLO].

II. INDICADORES OPERATIVOS REGISTRADOS
- Secciones activas distribuidas por turno (Diurno, Nocturno, Sabatino): [CANTIDAD - EJEMPLO].
- Docentes con carga horaria asignada y validada sin solapamiento: [CANTIDAD - EJEMPLO].
- Expedientes atendidos en Control de Estudios y requisitos de egreso (Servicio Comunitario, Pasantías, TEG): [CANTIDAD - EJEMPLO].

III. OBSERVACIONES Y ACCIONES DE MEJORA
- Se implementó la verificación preventiva de cruces de aulas y disponibilidad docente previo al inicio de clases.
- Se estandarizaron los requisitos visibles en cartelera para reducir reprocesos en trámites de egreso.

IV. CONCLUSIONES
La Extensión mantiene la continuidad operativa conforme a los lineamientos institucionales vigentes, quedando a disposición de la Dirección para la validación correspondiente.`,
    signerName: '[NOMBRE DEL COORDINADOR(A)]',
    signerRole: 'Coordinación Académica — Extensión Puerto Ordaz',
    isConfidential: false,
  },
  Comunicado: {
    docType: 'Comunicado',
    correlative: 'COMUNICADO N° [EJEMPLO]',
    senderOffice: 'Dirección de Extensión Puerto Ordaz',
    recipient: 'Estudiantado y Personal Docente del IUTIRLA Extensión Puerto Ordaz',
    subject: 'Aviso importante sobre reprogramación o lineamientos institucionales',
    body: `La Dirección del Instituto Universitario de Tecnología Industrial "Rodolfo Loero Arismendi" (IUTIRLA), Extensión Puerto Ordaz, hace del conocimiento de todo su personal docente, administrativo y población estudiantil que, a partir del [FECHA - EJEMPLO], [DESCRIPCIÓN CLARA DEL AVISO O CONTINGENCIA - EJEMPLO].

Las actividades académicas correspondientes a los turnos Diurno, Nocturno y Sabatino continuarán desarrollándose conforme a las instrucciones emitidas por cada Coordinación de Especialidad y los canales oficiales de la institución.

Agradecemos mantenerse atentos a la Cartelera Digital y a los comunicados debidamente refrendados por esta Dirección.`,
    signerName: 'La Dirección de Extensión',
    signerRole: 'IUTIRLA — Extensión Puerto Ordaz, Ciudad Guayana',
    isConfidential: false,
  },
};
