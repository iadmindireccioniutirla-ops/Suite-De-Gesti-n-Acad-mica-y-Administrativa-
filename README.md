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
