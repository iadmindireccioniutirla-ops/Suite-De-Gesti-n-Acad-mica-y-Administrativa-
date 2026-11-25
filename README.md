# Suite de Gestión Académica y Administrativa — IUTIRLA Puerto Ordaz

Aplicación para apoyar la gestión de la Dirección y Coordinación Académica de la
Extensión Puerto Ordaz. Incluye panel principal, documentos oficiales, horarios
con detección de cruces, cartelera y trámites estudiantiles, y un asistente
opcional conectado a Gemini.

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0` (requisito de Vite 8)
- npm
- Una clave de Gemini API solo si se desea habilitar el asistente

## Instalación y desarrollo

Instala las dependencias:

```sh
npm install
```

Copia `.env.example` a `.env.local` y agrega `GEMINI_API_KEY` para usar el
asistente. En PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Inicia la aplicación en modo desarrollo:

```sh
npm run dev
```

Abre <http://localhost:3000>. Sin una clave Gemini, el resto de los módulos
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

El asistente de Gemini queda deshabilitado si no se configura
`GEMINI_API_KEY`. No agregues esa clave hasta contar con controles contra el uso
no autorizado del endpoint público. El servidor limita cada dirección IP a 10
consultas cada 15 minutos; este límite reduce el abuso, pero no sustituye un
sistema de autenticación ni una cuota de gasto configurada en Google AI Studio.
La clave debe guardarse como secreto en Render, nunca en GitHub ni en variables
`VITE_*`. No envíes al asistente nombres, cédulas, calificaciones, expedientes ni
otros datos personales o confidenciales.
El asistente usa primero la Interactions API oficial de Google GenAI con
`store=false`, recurre a `generateContent` si el proyecto o modelo no admite esa
operación y, ante una indisponibilidad 503, prueba Gemini 3.8 Flash y luego
Gemini 3.5 Flash-Lite. En ambos casos la conversación se envía a Google para
generar la respuesta; `store=false` evita guardar la interacción para
recuperarla mediante la API.

## Datos y privacidad

Los horarios, avisos, hitos del calendario y el borrador de documento se guardan
en el almacenamiento local del navegador. No se sincronizan entre dispositivos.
El historial del asistente solo permanece en memoria durante la sesión.

Los datos de ejemplo y las orientaciones incluidas son material de referencia;
verifica fechas, requisitos y normativa con las autoridades institucionales
antes de emitir comunicaciones oficiales.

## Asistente Gemini

La clave `GEMINI_API_KEY` se configura únicamente en el entorno del servidor.
No la incluyas en el código fuente ni en variables `VITE_*`, que pueden quedar
expuestas en el navegador.
