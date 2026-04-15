# Frontend - Mis Eventos

Aplicación web en React para autenticación, gestión de eventos, suscripción a eventos y visualización de perfil.

## Stack

- React + TypeScript + Vite
- React Router
- Redux Toolkit
- Axios
- Tailwind + shadcn/ui
- Vitest + Testing Library

## Configuración local

1. Copia variables de entorno:

```bash
cp .env.example .env
```

2. Instala dependencias:

```bash
npm install
```

3. Ejecuta en desarrollo:

```bash
npm run dev
```

## Scripts

- `npm run dev` - entorno local
- `npm run build` - build de producción
- `npm run lint` - análisis estático
- `npm run test` - pruebas unitarias
- `npm run test:coverage` - cobertura de tests

## Rutas principales

- `/login`
- `/register`
- `/dashboard`
- `/events` (mis eventos)
- `/all-events` (eventos disponibles)
- `/profile` (usuario + eventos registrados)
