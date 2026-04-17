# Guía de API y Desarrollo

Actualmente, el sitio `World OF Wanos Web` es una aplicación estática basada en Vanilla JS, por lo que no expone una API REST propia. Sin embargo, está preparada para consumir datos externos.

## Futuras Integraciones de API
Para desarrolladores que deseen colaborar, estos son los puntos de expansión:

1.  **Endpoint del Servidor**: Consultar el estado del reino de UltimoWoW.
2.  **Rastreador de Miembros**: Implementar una llamada a una base de datos local para actualizar el "Hall of Greens" dinámicamente.
3.  **Logs de Raid**: Integración con WarcraftLogs o sistemas similares.

## Cómo añadir funciones dinámicas
Consulta la función `initWeather()` en `main.js` para entender cómo se gestionan los estados periódicos dentro del sitio.
