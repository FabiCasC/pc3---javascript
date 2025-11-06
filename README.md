# CREAZA - Share Your Art

Una aplicación web para que artistas, diseñadores y creadores compartan su trabajo e inspiren a otros.

## Tecnologías

- **React 19** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Framework de CSS utility-first
- **React Router** - Enrutamiento de la aplicación
- **shadcn/ui** - Componentes de UI basados en Radix UI

## Instalación

1. Instala las dependencias:
```bash
pnpm install
```

## Desarrollo

Ejecuta el servidor de desarrollo:
```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:5173`

## Build

Para crear una build de producción:
```bash
pnpm build
```

Para previsualizar la build de producción:
```bash
pnpm preview
```

## Estructura del Proyecto

```
├── src/
│   ├── pages/          # Páginas de la aplicación
│   ├── App.tsx         # Componente principal con rutas
│   ├── main.tsx        # Punto de entrada
│   └── index.css       # Estilos globales con Tailwind
├── components/         # Componentes reutilizables
├── lib/               # Utilidades y lógica de negocio
├── public/            # Archivos estáticos
└── vite.config.ts     # Configuración de Vite
```

## Características

- Autenticación con localStorage
- Galería de imágenes tipo masonry
- Perfiles de usuario
- Sistema de likes
- Categorización de contenido
- Modo oscuro/claro


