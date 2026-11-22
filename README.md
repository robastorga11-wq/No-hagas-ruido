# NO HAGAS RUIDO

Prototipo 3D de terror cooperativo para hasta tres supervivientes.

## Estado actual
- Escenario 3D y controles táctiles básicos.
- Comunicación multijugador mediante Socket.IO.
- Monstruo controlado por lógica del servidor que investiga la última fuente de ruido.
- Base Android con Capacitor y compilación de APK de depuración mediante GitHub Actions.

## Importante
Este repositorio es el código fuente, no un juego online publicado. Para jugar desde distintos teléfonos falta desplegar `server.js` en un hosting Node.js compatible con WebSockets y configurar la URL pública en `public/index.html`. Las salas privadas con códigos y los puzles siguen pendientes.

## Ejecutar servidor
1. Instalar Node.js 20 o superior.
2. Ejecutar `npm install`.
3. Ejecutar `npm start`.
4. Abrir `http://localhost:3000`.

## APK de prueba
En GitHub, abre **Actions** y ejecuta **Build Android APK**. Al finalizar, descarga el artefacto `no-hagas-ruido-debug-apk`. Es un APK de depuración, no una versión firmada para Play Store.
