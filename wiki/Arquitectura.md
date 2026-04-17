# Arquitectura del Sistema - World OF Wanos Web

Este documento describe la estructura técnica y el flujo de datos del sitio web de la hermandad.

## Diseño Orientado a Estética
El sitio sigue un patrón de diseño **Single Page Application (SPA)** simplificado, donde todo el contenido se carga inicialmente y se gestiona mediante interactividad en el cliente.

### Componentes Principales
1.  **Motor de Partículas**: Implementado en `<canvas>` para simular nieve y neblina de Rasganorte sin penalizar el rendimiento del DOM.
2.  **Sistema de Diseño (CSS Variables)**: Centraliza los colores institucionales (Azul Glacial, Dorado) para facilitar cambios globales.
3.  **Intersection Observer**: Gestio de animaciones de entrada (fade-in) para una experiencia fluida al hacer scroll.

## Estructura de Archivos
- `index.html`: Esqueleto semántico.
- `index.css`: Estilos, animaciones y tipografías.
- `main.js`: Lógica de negocio (Contadores, Clima, Quotes).
- `assets/`: 
    - `images/`: Capturas y retratos de líderes en alta resolución.
    - `icons/`: (Pendiente) Iconos de clases de WoW.

## Integraciones
- **Discord**: Integración mediante enlaces directos y (futuramente) widget personalizado.
- **API (Próximamente)**: Capacidad de conectar con bases de datos de servidores de WoW para rankings dinámicos.
