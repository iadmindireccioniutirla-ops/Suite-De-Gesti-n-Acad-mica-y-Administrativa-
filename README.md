# Suite de Gestión Académica y Administrativa — IUTIRLA Puerto Ordaz

Aplicación para apoyar la gestión de la Dirección y Coordinación Académica de la
Extensión Puerto Ordaz. Incluye panel principal, documentos oficiales, horarios
con detección de cruces, cartelera y trámites estudiantiles, y un asistente
opcional conectado a un proveedor de IA configurable.

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0` (requisito de Vite 8)
- npm
- Una clave del proveedor de IA elegido solo si se desea habilitar el asistente

## Instalación y desarrollo

Instala las dependencias:

```sh
npm install
```

Copia `.env.example` a `.env.local` y configura la clave del proveedor elegido
para usar el asistente. En PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Inicia la aplicación en modo desarrollo:

```sh
npm run dev
```

Abre <http://localhost:3000>. Sin una clave de IA, el resto de los módulos
continúa disponible; el servidor informa que el asistente no está configurado.

## Compilación y ejecución

```sh
npm run lint
npm run build
npm start
```

`npm start` ejecuta el servidor Express en modo producción y sirve la carpeta
`dist`. Ejecuta primero `npm run build`. El puerto predeterminado es `3000` y
se puede cambiar con `PORT`.

## Despliegue público en Render

El archivo `render.yaml` configura un servicio web en Virginia con despliegue
automático desde `main`. Para publicarlo:

1. Inicia sesión o crea una cuenta en [Render](https://dashboard.render.com/).
2. Selecciona **New > Blueprint** y conecta el repositorio de GitHub
   `iadmindireccioniutirla-ops/Suite-De-Gesti-n-Acad-mica-y-Administrativa-`.
3. Confirma la configuración del Blueprint y crea el servicio. Render compilará
   la aplicación y mostrará la URL pública cuando el primer despliegue termine.

La configuración usa el plan gratuito, pensado para pruebas y demostraciones,
no para operación institucional: Render suspende el servicio tras 15 minutos sin
tráfico y el siguiente acceso puede tardar alrededor de un minuto. Además, el
sistema de archivos del servicio no es persistente. Los datos actuales de la
suite se guardan en el navegador de cada usuario, no en Render.
Durante ese inicio puede aparecer una pantalla temporal de Render en lugar de
la suite; espera a que termine y vuelve a enviar la consulta si el chat no pudo
conectarse.

El asistente queda deshabilitado si no se configura la clave del proveedor.
No agregues esa clave hasta contar con controles contra el uso no autorizado
del endpoint. El asistente requiere una sesión institucional y
además limita cada dirección IP a 10 consultas cada 15 minutos; esto no
sustituye los límites y controles de uso del proveedor elegido. La clave debe
guardarse como secreto en Render, nunca en GitHub ni en variables `VITE_*`. No
envíes al asistente nombres, cédulas, calificaciones, expedientes ni otros datos
personales o confidenciales.
El asistente usa Gemini por defecto (`AI_PROVIDER=gemini`) y también permite
configurar Groq (`AI_PROVIDER=groq`). Para Groq, configura `GROQ_API_KEY` y,
opcionalmente, `GROQ_MODEL`; el modelo predeterminado es
`llama-3.3-70b-versatile`. Las cuotas y disponibilidad dependen del proveedor y
de su plan. Las claves deben guardarse como secretos en el servidor.

Con Gemini, el asistente usa primero la Interactions API oficial de Google GenAI
con `store=false`, recurre a `generateContent` si el proyecto o modelo no admite
esa operación y, ante una indisponibilidad 503, prueba Gemini 3.8 Flash y luego
Gemini 3.5 Flash-Lite. La conversación se envía al proveedor configurado para
generar la respuesta.

## Datos y privacidad

Los horarios, avisos, hitos del calendario y el borrador de documento se guardan
en el almacenamiento local del navegador. No se sincronizan entre dispositivos.
El historial del asistente solo permanece en memoria durante la sesión.

Los datos de ejemplo y las orientaciones incluidas son material de referencia;
verifica fechas, requisitos y normativa con las autoridades institucionales
antes de emitir comunicaciones oficiales.

## Configuración del asistente

Configura `AI_PROVIDER` como `gemini` o `groq` en el entorno del servidor y
agrega la clave correspondiente (`GEMINI_API_KEY` o `GROQ_API_KEY`). No incluyas
claves en el código fuente ni en variables `VITE_*`, que pueden quedar expuestas
en el navegador.

## Inicio de sesión institucional

La suite requiere una sesión para mostrar sus módulos y el servidor también
protege el endpoint del asistente. En Render, configura estas variables en
**Environment**:

- `ADMIN_EMAIL`: `iadmindireccioniutirla@gmail.com`
- `ADMIN_PASSWORD`: una contraseña nueva y exclusiva, guardada como secreto
- `AUTH_SESSION_SECRET`: genera un valor aleatorio de al menos 32 caracteres y
  guárdalo como secreto

No reutilices contraseñas que hayas compartido en chats ni las incluyas en
GitHub. La sesión vence a las 12 horas. Los datos de la suite siguen guardándose
localmente en el navegador; el inicio de sesión no cifra esos datos ni protege
el equipo compartido de otros usuarios con acceso al mismo perfil del navegador.
