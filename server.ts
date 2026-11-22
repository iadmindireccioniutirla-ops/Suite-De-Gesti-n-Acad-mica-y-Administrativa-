import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `Eres el Asistente IA de Dirección y Coordinación Académica (habilidad especializada ia-admin-direccion-iutirla), diseñado originalmente por Leonardo Salazar para el Instituto Universitario de Tecnología Industrial "Rodolfo Loero Arismendi" (IUTIRLA), Extensión Puerto Ordaz, Ciudad Guayana, Estado Bolívar, República Bolivariana de Venezuela.

REGLAS ESTRICTAS DE OPERACIÓN (OBLIGATORIAS):
1. TONO Y FORMATO: Emplea un lenguaje formal, ejecutivo, objetivo, claro y respetuoso, acorde con la normativa y protocolo de la educación superior venezolana (MPPEU / IUTIRLA).
2. CERO ALUCINACIONES / NO INVENTAR DATOS OFICIALES:
   - NUNCA inventes resoluciones internas, números de oficio, códigos de circular, nombres de autoridades vigentes, fechas exactas del calendario académico ni códigos de asignaturas que no hayan sido suministrados por el usuario o en el contexto adjunto.
   - Cuando falte algún dato específico, inserta marcadores claros entre corchetes como [EJEMPLO], [FECHA], [N° DE OFICIO], [N° DE CIRCULAR], [NOMBRE DEL COORDINADOR], [DIRECTOR(A) DE EXTENSIÓN] o [CÓDIGO DE ASIGNATURA].
3. CONFIDENCIALIDAD Y DISCRECIÓN:
   - Mantén estricta confidencialidad, trato profesional y reserva institucional cuando se trate de llamados de atención, actas disciplinarias o consultas sobre rendimiento estudiantil. Ante estos casos, incluye un encabezado o nota de uso confidencial y evita juicios subjetivos.
4. CLARIDAD OPERATIVA Y TABLAS:
   - Cuando presentes cronogramas trimestrales, distribuciones de carga horaria o matrices de seguimiento, usa tablas Markdown limpias y bien estructuradas, listas para trasladar a hojas de cálculo o carteleras informativas.
5. MENÚ OPERATIVO Y CONTEXTO DEL IUTIRLA EXTENSIÓN PUERTO ORDAZ:
   - Especialidades habituales de referencia: Informática, Administración, Relaciones Industriales, Publicidad y Mercadeo, Turismo.
   - Turnos: Diurno, Nocturno y Sabatino.
   - Organización académica: Períodos trimestrales.
   - Áreas operativas principales:
     1) Redacción de Documentos Oficiales (Memorandos, Circulares, Oficios, Actas de Consejo Académico, Comunicados).
     2) Planificación de Carga Docente y Cronogramas Trimestrales.
     3) Orientación Normativa para Trámites de Egreso (Servicio Comunitario, Pasantías Profesionales, Trabajo Especial de Grado - TEG) y control de estudios.
     4) Informes de Gestión y Control Operativo Departamental.
6. ESTRUCTURA PARA BORRADORES DE DOCUMENTOS:
   - Si el usuario solicita redactar un memorando, circular, oficio, acta o comunicado, incluye de forma explícita las líneas:
     TIPO: [Memorando / Circular / Oficio / Acta / Informe / Comunicado]
     ASUNTO: [Asunto claro y conciso]
     DESTINATARIO: [Destinatario o dependencia]
     Luego presenta el cuerpo completo redactado formalmente y el bloque de firma con marcadores si no se indicaron autoridades.`;

interface ChatMessageInput {
  role: 'user' | 'model';
  text: string;
}

interface ChatRequestBody {
  message?: unknown;
  history?: unknown;
  workspaceContext?: unknown;
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('MISSING_GEMINI_API_KEY');
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProduction =
    process.env.NODE_ENV === 'production' || process.env.npm_lifecycle_event === 'start';

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'iutirla-suite-api' });
  });

  app.post('/api/assistant/chat', async (req: Request, res: Response) => {
    try {
      const body = (req.body ?? {}) as ChatRequestBody;
      const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';

      if (!rawMessage) {
        res.status(400).json({ error: 'Debe ingresar una consulta o instrucción para el asistente.' });
        return;
      }
      if (rawMessage.length > 8000) {
        res.status(400).json({ error: 'El mensaje excede el límite permitido de 8.000 caracteres.' });
        return;
      }

      const rawHistory = Array.isArray(body.history) ? body.history : [];
      const sanitizedHistory: ChatMessageInput[] = rawHistory
        .filter((item): item is ChatMessageInput => {
          if (!item || typeof item !== 'object') return false;
          const candidate = item as Record<string, unknown>;
          return (
            (candidate.role === 'user' || candidate.role === 'model') &&
            typeof candidate.text === 'string' &&
            candidate.text.trim().length > 0
          );
        })
        .slice(-16)
        .map((item) => ({
          role: item.role,
          text: item.text.slice(0, 8000),
        }));

      const workspaceContext =
        typeof body.workspaceContext === 'string' && body.workspaceContext.trim()
          ? body.workspaceContext.trim().slice(0, 2000)
          : '';

      const ai = getGeminiClient();

      const contents = [
        ...sanitizedHistory.map((item) => ({
          role: item.role,
          parts: [{ text: item.text }],
        })),
        {
          role: 'user' as const,
          parts: [
            {
              text: workspaceContext
                ? `Contexto operativo actual del sistema:\n${workspaceContext}\n\nSolicitud del usuario:\n${rawMessage}`
                : rawMessage,
            },
          ],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      const replyText = response.text?.trim();
      if (!replyText) {
        res.status(502).json({
          error: 'El servicio de Gemini no devolvió contenido textual en esta respuesta.',
        });
        return;
      }

      res.json({ reply: replyText });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage === 'MISSING_GEMINI_API_KEY') {
        res.status(503).json({
          error:
            'No se ha configurado GEMINI_API_KEY en el entorno del servidor. Configure la clave en el panel Settings > Secrets para habilitar el Asistente IA.',
        });
        return;
      }

      if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('403')) {
        res.status(403).json({
          error:
            'La clave de Gemini API fue rechazada o carece de permisos. Verifique su configuración en el panel Settings > Secrets.',
        });
        return;
      }

      if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')) {
        res.status(429).json({
          error:
            'Se alcanzó temporalmente el límite de solicitudes de Gemini API. Intente nuevamente en unos instantes.',
        });
        return;
      }

      console.error('[assistant/chat] Error:', errorMessage);
      res.status(500).json({
        error: 'Ocurrió un error al comunicarse con el servicio de Gemini. Verifique la conexión e intente de nuevo.',
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build no encontrado. Ejecute npm run build primero.');
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`IUTIRLA Suite server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
