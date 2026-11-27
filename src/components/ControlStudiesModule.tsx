import { useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Clock3,
  CreditCard,
  FileText,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import type { ModuleId } from '../types/academic';

interface ControlStudiesModuleProps {
  onNavigate: (module: ModuleId) => void;
}

const OPTIONS = [
  {
    id: 1,
    title: 'Horarios y horas de ingreso',
    description: 'Hora de entrada y horario suministrado para Informática, segundo trimestre.',
    icon: Clock3,
  },
  {
    id: 2,
    title: 'Pagos e instrucciones SAA',
    description: 'Pasos generales para reportar una transferencia y recibir el aval digital.',
    icon: CreditCard,
  },
  {
    id: 3,
    title: 'Mora y materias pendientes',
    description: 'Orientación general y derivación cuando se requiere validación institucional.',
    icon: CalendarDays,
  },
  {
    id: 4,
    title: 'Asistencia, permisos y ayuda',
    description: 'Alcance actual y orientación para el personal docente y autorizado.',
    icon: HelpCircle,
  },
] as const;

const SCHEDULE_ROWS = [
  {
    time: '07:30–08:15',
    monday: 'Organización y Estructura del Computador (15)',
    tuesday: 'Inglés Instrumental II (15)',
    wednesday: 'Matemática II (20)',
    thursday: 'Sin actividad asignada',
    friday: 'Matemática II (20)',
  },
  {
    time: '08:15–09:00',
    monday: 'Organización y Estructura del Computador (15)',
    tuesday: 'Inglés Instrumental II (15)',
    wednesday: 'Matemática II (20)',
    thursday: 'Sin actividad asignada',
    friday: 'Matemática II (20)',
  },
  {
    time: '09:05–09:50',
    monday: 'Inteligencia Emocional (20)',
    tuesday: 'Estructura de Datos (13)',
    wednesday: 'Análisis y Diseño de Sistemas I (16)',
    thursday: 'Análisis y Diseño de Sistemas I (20)',
    friday: 'Programación I (20)',
  },
  {
    time: '09:50–10:35',
    monday: 'Inteligencia Emocional (20)',
    tuesday: 'Estructura de Datos (13)',
    wednesday: 'Análisis y Diseño de Sistemas I (16)',
    thursday: 'Análisis y Diseño de Sistemas I (20)',
    friday: 'Programación I (20)',
  },
  {
    time: '10:40–11:25',
    monday: 'Sin actividad asignada',
    tuesday: 'Organización y Estructura del Computador (15)',
    wednesday: 'Estructura de Datos (13)',
    thursday: 'Programación I (20)',
    friday: 'Inglés Instrumental II (15)',
  },
  {
    time: '11:25–12:10',
    monday: 'Sin actividad asignada',
    tuesday: 'Organización y Estructura del Computador (15)',
    wednesday: 'Estructura de Datos (13)',
    thursday: 'Programación I (20)',
    friday: 'Inglés Instrumental II (15)',
  },
] as const;

export function ControlStudiesModule({ onNavigate }: ControlStudiesModuleProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  return (
    <section className="space-y-6">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-xs font-medium text-[#8B0000]">
          Personal docente y autorizado
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Control de Estudios
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Orientación basada en la información proporcionada por el departamento.
          Confirme con la institución los datos operativos antes de realizar trámites.
        </p>
      </header>

      {selectedOption === null ? (
        <>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
            <p className="font-semibold">
              A continuación te daré una serie de opciones con funciones correspondientes a la
              función de departamento de control de estudio:
            </p>
            <p className="mt-1">Elija una opción del 1 al 4.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {OPTIONS.map(({ id, title, description, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedOption(id)}
                className="rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-[#8B0000]/50 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2 text-xs font-mono font-semibold text-[#8B0000]">
                  <Icon className="h-4 w-4" />
                  Opción {id}
                </span>
                <span className="mt-2 block text-base font-semibold text-slate-900">
                  {title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-slate-600">
                  {description}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => setSelectedOption(null)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a las opciones
          </button>

          {selectedOption === 1 && (
            <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Horario de Informática — Segundo Trimestre
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Hora de ingreso institucional indicada: 07:30 a. m. La salida corresponde
                  al final de la última materia en ejecución según el horario.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                      <th className="p-3 font-semibold">Hora</th>
                      <th className="p-3 font-semibold">Lunes</th>
                      <th className="p-3 font-semibold">Martes</th>
                      <th className="p-3 font-semibold">Miércoles</th>
                      <th className="p-3 font-semibold">Jueves</th>
                      <th className="p-3 font-semibold">Viernes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {SCHEDULE_ROWS.map((row) => (
                      <tr key={row.time}>
                        <th className="whitespace-nowrap p-3 font-mono font-medium text-slate-700">
                          {row.time}
                        </th>
                        <td className="p-3 text-slate-600">{row.monday}</td>
                        <td className="p-3 text-slate-600">{row.tuesday}</td>
                        <td className="p-3 text-slate-600">{row.wednesday}</td>
                        <td className="p-3 text-slate-600">{row.thursday}</td>
                        <td className="p-3 text-slate-600">{row.friday}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500">
                Los números entre paréntesis se conservan tal como fueron suministrados;
                verifique su significado con el horario oficial del departamento.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('schedules')}
                className="text-sm font-medium text-[#8B0000] underline underline-offset-2"
              >
                Abrir Horarios y Carga de la suite
              </button>
            </article>
          )}

          {selectedOption === 2 && (
            <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Pagos e instrucciones — IUTIRLA SAA
              </h3>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                Esta suite no publica números de cuenta. Solicite los datos bancarios
                directamente en la institución o mediante asesoría autorizada.
              </div>
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                <li>Obtenga el número de cuenta por un canal institucional autorizado.</li>
                <li>Ingrese al sistema SAA IUTIRLA y abra Inscripción o Pagos pendientes.</li>
                <li>Registre los datos de la transferencia y adjunte la imagen del pago (máximo 6 MB).</li>
                <li>Complete los pasos del sistema y espere la verificación institucional.</li>
              </ol>
              <p className="text-sm text-slate-700">
                Según la información suministrada, el aval o la factura se emite digitalmente
                tras verificar el pago.
              </p>
            </article>
          )}

          {selectedOption === 3 && (
            <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Mora y materias pendientes
              </h3>
              <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <p>
                  El material recibido no especifica la duración del lapso admitido. Esta
                  pantalla no calcula vencimientos ni determina si una deuda puede pagarse
                  directamente; confirme el plazo y el estado de cuenta con Control de
                  Estudios o Atención al Cliente.
                </p>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                Para pagar una materia pendiente, consulte el trámite vigente en SAA, use
                únicamente los datos bancarios entregados por la institución y adjunte el
                comprobante en el sistema para su verificación.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('bulletin')}
                className="text-sm font-medium text-[#8B0000] underline underline-offset-2"
              >
                Revisar Cartelera y Trámites
              </button>
            </article>
          )}

          {selectedOption === 4 && (
            <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Asistencia, permisos y recomendaciones
              </h3>
              <p className="text-sm leading-relaxed text-slate-700">
                La información recibida indica que asistencia, faltas y permisos deben
                gestionarse con reportes y lineamientos autorizados. Esta primera versión
                ofrece orientación, pero no registra ni almacena casos de personal.
              </p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                Para una validación oficial, acuda al departamento o a los canales
                institucionales autorizados. No incluya cédulas, datos de estudiantes ni
                información confidencial en consultas generales.
              </div>
              <button
                type="button"
                onClick={() => onNavigate('documents')}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#8B0000] underline underline-offset-2"
              >
                <FileText className="h-4 w-4" />
                Abrir Documentos Oficiales
              </button>
              <p className="flex items-start gap-2 text-xs text-slate-500">
                <ClipboardList className="mt-0.5 h-4 w-4 shrink-0" />
                Los registros operativos requieren definir permisos y almacenamiento seguro
                antes de habilitarse.
              </p>
            </article>
          )}
        </div>
      )}
    </section>
  );
}
