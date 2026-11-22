import type { ScheduleConflict, ScheduleEntry } from '../types/academic';

function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length !== 2) return -1;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return -1;
  return hours * 60 + minutes;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function formatOverlap(startA: number, endA: number, startB: number, endB: number): string {
  const start = Math.max(startA, startB);
  const end = Math.min(endA, endB);
  const pad = (n: number) => String(n).padStart(2, '0');
  const format = (mins: number) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
  return `${format(start)} - ${format(end)}`;
}

export function detectScheduleConflicts(entries: ScheduleEntry[]): {
  conflicts: ScheduleConflict[];
  conflictingEntryIds: Set<string>;
} {
  const conflicts: ScheduleConflict[] = [];
  const conflictingEntryIds = new Set<string>();

  for (let i = 0; i < entries.length; i += 1) {
    const a = entries[i];
    const startA = parseTimeToMinutes(a.startTime);
    const endA = parseTimeToMinutes(a.endTime);
    if (startA < 0 || endA <= startA) continue;

    for (let j = i + 1; j < entries.length; j += 1) {
      const b = entries[j];
      if (a.day !== b.day) continue;
      if (normalizeText(a.quarter) !== normalizeText(b.quarter)) continue;

      const startB = parseTimeToMinutes(b.startTime);
      const endB = parseTimeToMinutes(b.endTime);
      if (startB < 0 || endB <= startB) continue;

      const overlaps = startA < endB && startB < endA;
      if (!overlaps) continue;

      const overlapWindow = formatOverlap(startA, endA, startB, endB);

      if (normalizeText(a.teacher) === normalizeText(b.teacher) && a.teacher.trim() !== '') {
        conflicts.push({
          id: `teacher-${a.id}-${b.id}`,
          type: 'Docente',
          entryAId: a.id,
          entryBId: b.id,
          day: a.day,
          quarter: a.quarter,
          overlapWindow,
          resourceName: a.teacher,
          description: `El docente ${a.teacher} coincide en ${a.day} (${overlapWindow}) entre ${a.section} (${a.subjectName}) y ${b.section} (${b.subjectName}).`,
        });
        conflictingEntryIds.add(a.id);
        conflictingEntryIds.add(b.id);
      }

      if (normalizeText(a.classroom) === normalizeText(b.classroom) && a.classroom.trim() !== '') {
        conflicts.push({
          id: `room-${a.id}-${b.id}`,
          type: 'Aula',
          entryAId: a.id,
          entryBId: b.id,
          day: a.day,
          quarter: a.quarter,
          overlapWindow,
          resourceName: a.classroom,
          description: `El espacio ${a.classroom} presenta doble asignación el ${a.day} (${overlapWindow}) para ${a.section} y ${b.section}.`,
        });
        conflictingEntryIds.add(a.id);
        conflictingEntryIds.add(b.id);
      }

      if (
        normalizeText(a.section) === normalizeText(b.section) &&
        a.section.trim() !== '' &&
        a.specialty === b.specialty
      ) {
        conflicts.push({
          id: `section-${a.id}-${b.id}`,
          type: 'Sección',
          entryAId: a.id,
          entryBId: b.id,
          day: a.day,
          quarter: a.quarter,
          overlapWindow,
          resourceName: a.section,
          description: `La sección ${a.section} (${a.specialty}) tiene dos asignaturas superpuestas el ${a.day} (${overlapWindow}): ${a.subjectName} y ${b.subjectName}.`,
        });
        conflictingEntryIds.add(a.id);
        conflictingEntryIds.add(b.id);
      }
    }
  }

  return { conflicts, conflictingEntryIds };
}

export function buildScheduleTSV(entries: ScheduleEntry[]): string {
  const headers = [
    'Trimestre',
    'Especialidad',
    'Turno',
    'Sección',
    'Código',
    'Asignatura',
    'Docente',
    'Día',
    'Horario',
    'Aula',
  ];
  const rows = entries.map((e) => [
    e.quarter,
    e.specialty,
    e.shift,
    e.section,
    e.subjectCode,
    e.subjectName,
    e.teacher,
    e.day,
    `${e.startTime} - ${e.endTime}`,
    e.classroom,
  ]);
  return [headers, ...rows].map((row) => row.join('\t')).join('\n');
}

function escapeCsvCell(value: string): string {
  const clean = value.replace(/"/g, '""');
  return `"${clean}"`;
}

export function buildScheduleCSV(entries: ScheduleEntry[]): string {
  const headers = [
    'Trimestre',
    'Especialidad',
    'Turno',
    'Sección',
    'Código',
    'Asignatura',
    'Docente',
    'Día',
    'Hora Inicio',
    'Hora Fin',
    'Aula',
  ];
  const rows = entries.map((e) => [
    e.quarter,
    e.specialty,
    e.shift,
    e.section,
    e.subjectCode,
    e.subjectName,
    e.teacher,
    e.day,
    e.startTime,
    e.endTime,
    e.classroom,
  ]);
  return '\uFEFF' + [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}
