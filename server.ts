import 'dotenv/config';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ApiError, GoogleGenAI } from '@google/genai';

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

const PRIMARY_GEMINI_MODEL = 'gemini-4-hydrogen';
const FALLBACK_GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash-lite'] as const;
const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_CLOUDFLARE_MODEL = '@cf/meta/llama-3.1-8b-instruct';
const AUTH_COOKIE_NAME = 'iutirla_session';
const SESSION_DURATION_SECONDS = 12 * 60 * 60;

const assistantChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Se alcanzó el límite de consultas al asistente. Intente nuevamente en 15 minutos.',
  },
});

const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: 'Se excedieron los intentos de inicio de sesión. Intente nuevamente en 15 minutos.',
  },
});

interface ChatMessageInput {
  role: 'user' | 'model';
  text: string;
}

interface ChatRequestBody {
  message?: unknown;
  history?: unknown;
  workspaceContext?: unknown;
}

interface LoginRequestBody {
  email?: unknown;
  password?: unknown;
}

interface AuthConfiguration {
  email: string;
  password: string;
  sessionSecret: string;
}

interface AuthSession {
  email: string;
  expiresAt: number;
}

function getAuthConfiguration(): AuthConfiguration | null {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.AUTH_SESSION_SECRET;
  if (!email || !password || !sessionSecret || sessionSecret.length < 32) {
    return null;
  }
  return { email, password, sessionSecret };
}

function safeStringEqual(left: string, right: string): boolean {
  const leftHash = createHash('sha256').update(left).digest();
  const rightHash = createHash('sha256').update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function createSessionToken(email: string, sessionSecret: string): AuthSession & { token: string } {
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ email, expiresAt })).toString('base64url');
  const signature = createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  return { email, expiresAt, token: `${payload}.${signature}` };
}

function readAuthSession(
  req: Request,
  authConfig: Pick<AuthConfiguration, 'email' | 'sessionSecret'>,
): AuthSession | null {
  const cookie = req
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`))
    ?.slice(AUTH_COOKIE_NAME.length + 1);
  if (!cookie) return null;

  const [payload, signature] = cookie.split('.');
  if (!payload || !signature) return null;
  const expectedSignature = createHmac('sha256', authConfig.sessionSecret).update(payload).digest();
  const receivedSignature = Buffer.from(signature, 'base64url');
  if (
    receivedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(receivedSignature, expectedSignature)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AuthSession;
    if (
      typeof session.email !== 'string' ||
      typeof session.expiresAt !== 'number' ||
      session.expiresAt <= Date.now() ||
      session.email.toLowerCase() !== authConfig.email.toLowerCase()
    ) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function setAuthCookie(res: Response, token: string, isProduction: boolean): void {
  const secure = isProduction ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DURATION_SECONDS}${secure}`,
  );
}

function clearAuthCookie(res: Response, isProduction: boolean): void {
  const secure = isProduction ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`,
  );
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

function getAssistantProvider(): 'gemini' | 'groq' | 'cloudflare' {
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase() || 'gemini';
  if (provider !== 'gemini' && provider !== 'groq' && provider !== 'cloudflare') {
    throw new Error('INVALID_ASSISTANT_PROVIDER');
  }
  return provider;
}

function getGroqApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('MISSING_GROQ_API_KEY');
  }
  return apiKey.trim();
}

async function generateWithGroq(
  apiKey: string,
  history: ChatMessageInput[],
  currentRequest: string,
): Promise<string | undefined> {
  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        ...history.map((item) => ({
          role: item.role === 'user' ? 'user' : 'assistant',
          content: item.text,
        })),
        { role: 'user', content: currentRequest },
      ],
    }),
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw Object.assign(new Error(`Groq returned an invalid response (${response.status}).`), {
      status: response.status,
    });
  }

  if (!response.ok) {
    throw Object.assign(new Error(`Groq API request failed (${response.status}).`), {
      status: response.status,
    });
  }

  if (!payload || typeof payload !== 'object' || !('choices' in payload)) {
    throw new Error('Groq returned an unexpected response shape.');
  }
  const choices = payload.choices;
  if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== 'object') {
    return undefined;
  }
  const message = choices[0].message;
  if (!message || typeof message !== 'object' || !('content' in message)) {
    return undefined;
  }
  return typeof message.content === 'string' ? message.content : undefined;
}

function getCloudflareCredentials(): { accountId: string; apiToken: string } {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (!accountId) {
    throw new Error('MISSING_CLOUDFLARE_ACCOUNT_ID');
  }
  if (!apiToken) {
    throw new Error('MISSING_CLOUDFLARE_API_TOKEN');
  }
  return { accountId, apiToken };
}

async function generateWithCloudflare(
  accountId: string,
  apiToken: string,
  history: ChatMessageInput[],
  currentRequest: string,
): Promise<string | undefined> {
  const model = process.env.CLOUDFLARE_MODEL?.trim() || DEFAULT_CLOUDFLARE_MODEL;
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${model}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          ...history.map((item) => ({
            role: item.role === 'user' ? 'user' : 'assistant',
            content: item.text,
          })),
          { role: 'user', content: currentRequest },
        ],
        max_tokens: 1024,
      }),
    },
  );

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw Object.assign(
      new Error(`Cloudflare Workers AI returned an invalid response (${response.status}).`),
      { status: response.status },
    );
  }

  if (!response.ok) {
    throw Object.assign(
      new Error(`Cloudflare Workers AI request failed (${response.status}).`),
      { status: response.status },
    );
  }

  if (!payload || typeof payload !== 'object' || !('result' in payload)) {
    throw new Error('Cloudflare Workers AI returned an unexpected response shape.');
  }
  const result = payload.result;
  if (!result || typeof result !== 'object' || !('response' in result)) {
    return undefined;
  }
  return typeof result.response === 'string' ? result.response : undefined;
}

function getGeminiErrorStatus(err: unknown): number | undefined {
  if (err instanceof ApiError) {
    return err.status;
  }
  if (typeof err === 'object' && err !== null) {
    if ('status' in err && typeof err.status === 'number') {
      return err.status;
    }
    if (
      'error' in err &&
      typeof err.error === 'object' &&
      err.error !== null &&
      'code' in err.error &&
      typeof err.error.code === 'number'
    ) {
      return err.error.code;
    }
  }

  const errorMessage = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(errorMessage) as { error?: { code?: unknown } };
    return typeof parsed.error?.code === 'number' ? parsed.error.code : undefined;
  } catch {
    return undefined;
  }
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProduction =
    process.env.NODE_ENV === 'production' || process.env.npm_lifecycle_event === 'start';

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'iutirla-suite-api' });
  });

  app.get('/api/auth/session', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const authConfig = getAuthConfiguration();
    if (!authConfig) {
      res.status(503).json({ error: 'El acceso institucional aún no está configurado en el servidor.' });
      return;
    }

    const session = readAuthSession(req, authConfig);
    if (!session) {
      res.status(401).json({ authenticated: false });
      return;
    }
    res.json({ authenticated: true, email: session.email, expiresAt: session.expiresAt });
  });

  app.post('/api/auth/login', authLoginLimiter, (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const authConfig = getAuthConfiguration();
    if (!authConfig) {
      res.status(503).json({ error: 'El acceso institucional aún no está configurado en el servidor.' });
      return;
    }

    const body = (req.body ?? {}) as LoginRequestBody;
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const validEmail = email === authConfig.email.toLowerCase();
    const validPassword = safeStringEqual(password, authConfig.password);
    if (!validEmail || !validPassword) {
      res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
      return;
    }

    const session = createSessionToken(authConfig.email, authConfig.sessionSecret);
    setAuthCookie(res, session.token, isProduction);
    res.json({
      authenticated: true,
      email: session.email,
      expiresAt: session.expiresAt,
    });
  });

  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    clearAuthCookie(res, isProduction);
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true });
  });

  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authConfig = getAuthConfiguration();
    if (!authConfig) {
      res.status(503).json({ error: 'El acceso institucional aún no está configurado en el servidor.' });
      return;
    }
    if (!readAuthSession(req, authConfig)) {
      res.status(401).json({ error: 'Inicie sesión para continuar.' });
      return;
    }
    next();
  };

  app.post('/api/assistant/chat', requireAuth, assistantChatLimiter, async (req: Request, res: Response) => {
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

      const conversationHistory = sanitizedHistory
        .map((item) => `${item.role === 'user' ? 'Usuario' : 'Asistente'}: ${item.text}`)
        .join('\n\n');
      const currentRequest = workspaceContext
        ? `Contexto operativo actual del sistema:\n${workspaceContext}\n\nSolicitud del usuario:\n${rawMessage}`
        : rawMessage;
      const input = conversationHistory
        ? `${conversationHistory}\n\nUsuario: ${currentRequest}`
        : currentRequest;

      let generatedText: string | undefined;
      const provider = getAssistantProvider();
      if (provider === 'cloudflare') {
        const { accountId, apiToken } = getCloudflareCredentials();
        generatedText = await generateWithCloudflare(
          accountId,
          apiToken,
          sanitizedHistory,
          currentRequest,
        );
      } else if (provider === 'groq') {
        generatedText = await generateWithGroq(
          getGroqApiKey(),
          sanitizedHistory,
          currentRequest,
        );
      } else {
        const ai = getGeminiClient();
        const contents = [
          ...sanitizedHistory.map((item) => ({
            role: item.role,
            parts: [{ text: item.text }],
          })),
          {
            role: 'user' as const,
            parts: [{ text: currentRequest }],
          },
        ];

        const generateWithModel = async (model: string): Promise<string | undefined> => {
          try {
            const response = await ai.interactions.create({
              model,
              input,
              system_instruction: SYSTEM_INSTRUCTION,
              store: false,
            });
            return response.output_text;
          } catch (err: unknown) {
            const errorStatus = getGeminiErrorStatus(err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(
              `[assistant/chat] ${model} Interactions API error (${errorStatus ?? 'unknown'}):`,
              errorMessage,
            );
            if (errorStatus === undefined || ![400, 404, 405].includes(errorStatus)) {
              throw err;
            }

            console.warn(
              `[assistant/chat] Retrying ${model} with generateContent after Interactions API returned ${errorStatus}.`,
            );
            try {
              const fallbackResponse = await ai.models.generateContent({
                model,
                contents,
                config: {
                  systemInstruction: SYSTEM_INSTRUCTION,
                },
              });
              return fallbackResponse.text;
            } catch (fallbackError: unknown) {
              const fallbackStatus = getGeminiErrorStatus(fallbackError);
              const fallbackMessage =
                fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
              console.error(
                `[assistant/chat] ${model} generateContent error (${fallbackStatus ?? 'unknown'}):`,
                fallbackMessage,
              );
              throw fallbackError;
            }
          }
        };

        const models = [PRIMARY_GEMINI_MODEL, ...FALLBACK_GEMINI_MODELS];
        for (let index = 0; index < models.length; index += 1) {
          const model = models[index];
          try {
            generatedText = await generateWithModel(model);
            break;
          } catch (err: unknown) {
            if (getGeminiErrorStatus(err) !== 503 || index === models.length - 1) {
              throw err;
            }
            console.warn(
              `[assistant/chat] ${model} is unavailable; trying ${models[index + 1]}.`,
            );
          }
        }
      }

      const replyText = generatedText?.trim();
      if (!replyText) {
        res.status(502).json({
          error: 'El proveedor de IA no devolvió contenido textual en esta respuesta.',
        });
        return;
      }

      res.json({ reply: replyText });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const status = getGeminiErrorStatus(err);
      const configuredProvider = process.env.AI_PROVIDER?.trim().toLowerCase();
      const providerName =
        configuredProvider === 'groq'
          ? 'Groq'
          : configuredProvider === 'cloudflare'
            ? 'Cloudflare Workers AI'
            : 'Gemini';

      if (errorMessage === 'MISSING_GEMINI_API_KEY') {
        res.status(503).json({
          error:
            'No se ha configurado GEMINI_API_KEY en el entorno del servidor. Guarde la clave como secreto en Render para habilitar el Asistente IA.',
        });
        return;
      }

      if (errorMessage === 'MISSING_GROQ_API_KEY') {
        res.status(503).json({
          error: 'No se ha configurado GROQ_API_KEY en el entorno del servidor. Guarde la clave como secreto en Render.',
        });
        return;
      }

      if (errorMessage === 'MISSING_CLOUDFLARE_ACCOUNT_ID') {
        res.status(503).json({
          error: 'No se ha configurado CLOUDFLARE_ACCOUNT_ID en el entorno del servidor.',
        });
        return;
      }

      if (errorMessage === 'MISSING_CLOUDFLARE_API_TOKEN') {
        res.status(503).json({
          error: 'No se ha configurado CLOUDFLARE_API_TOKEN en el entorno del servidor. Guarde el token como secreto en Render.',
        });
        return;
      }

      if (errorMessage === 'INVALID_ASSISTANT_PROVIDER') {
        res.status(503).json({
          error: 'AI_PROVIDER debe tener el valor "gemini", "groq" o "cloudflare".',
        });
        return;
      }

      if (status === 401 || status === 403) {
        res.status(403).json({
          error: `La clave de ${providerName} fue rechazada o carece de permisos. Verifique su configuración en Render.`,
        });
        return;
      }

      if (status === 429) {
        res.status(429).json({
          error: `${providerName} alcanzó su cuota o límite temporal. Espere e intente nuevamente o revise la cuota del proveedor.`,
        });
        return;
      }

      if (status !== undefined && status >= 500) {
        console.error(`[assistant/chat] ${providerName} API error (${status}):`, errorMessage);
        res.status(503).json({
          error: `El servicio de ${providerName} está temporalmente indisponible. Intente nuevamente en unos instantes.`,
        });
        return;
      }

      console.error('[assistant/chat] Error:', errorMessage);
      res.status(502).json({
        error: `${providerName} no pudo procesar la solicitud. Verifique el mensaje y la configuración del proveedor.`,
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
