# NO HAGAS RUIDO — paquete base para Android / Google Play

Este paquete adapta el prototipo web 3D a una estructura de app Android usando Capacitor e incluye controles táctiles básicos.

## Importante
Esto es un proyecto fuente preparado para generar la app Android. No es todavía un APK/AAB firmado ni una publicación en Google Play.

## Pasos para generar el proyecto Android
Requisitos: Node.js LTS, Android Studio y Android SDK.

1. En esta carpeta ejecuta `npm install`.
2. Ejecuta `npx cap add android`.
3. Abre `capacitor.config.json` y configura `server.url` cuando el servidor online esté publicado.
4. Ejecuta `npx cap sync android`.
5. Ejecuta `npx cap open android`.
6. En Android Studio configura el identificador definitivo, versión, iconos y firma.
7. Genera un Android App Bundle (.aab) firmado desde Build > Generate Signed Bundle / APK.

## Servidor multijugador
El backend Socket.IO debe desplegarse en un servicio público compatible con Node.js y WebSockets. Usa HTTPS/WSS. El cliente debe conectarse a la URL pública del servidor. Antes de compilar, en `public/index.html`, antes de `game.js`, puedes definir:
`<script>window.GAME_SERVER_URL = "https://TU-SERVIDOR";</script>`

No uses localhost para jugadores externos. El servidor del juego y la app Android son dos partes separadas.

## Requisitos de publicación pendientes
- Cuenta de desarrollador Google Play y verificación.
- Nombre legal/contacto del desarrollador.
- Icono final y capturas reales de Android.
- URL pública de política de privacidad.
- Formulario de Seguridad de datos y clasificación IARC.
- Pruebas internas/cerradas y requisitos de acceso aplicables a la cuenta.
- AAB firmado y cumplimiento del nivel de API objetivo vigente de Google Play.

## Estado funcional del prototipo
Incluye mundo 3D, Socket.IO, hasta tres conexiones, sincronización básica de posiciones y monstruo que persigue la última fuente de ruido. Es una base inicial: falta mejorar IA y navegación del monstruo, animaciones, optimización móvil, salas privadas y pruebas en dispositivos reales.
