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

## Lógica actual de roles y permisos

La aplicación inicia con un usuario **super admin** (administrador global). Este rol tiene control total sobre la plataforma:

- Puede crear eventos de forma global.
- Puede editar y eliminar eventos, incluyendo eventos creados por otros usuarios.
- Puede asignar usuarios a eventos y gestionar roles dentro del evento.
- Puede asignar asistentes en eventos.
- Puede eliminar usuarios del sistema (y, por consecuencia funcional, su gestión de eventos queda deshabilitada).

### Roles dentro del evento vs. participantes

Para el conteo de participantes de un evento se considera únicamente a usuarios con rol **`usuario`** en el registro del evento.

- **Sí cuenta como participante:** usuario con rol `usuario` inscrito en el evento.
- **No cuenta como participante:** `asistente`, `organizador` o `admin` (se consideran gestores del evento).

### Alcance del rol asistente

El rol **asistente** tiene permisos limitados y orientados a apoyo operativo:

- Puede agregar al evento usuarios que aún no estén registrados (como participantes).
- Puede promover participantes (`usuario`) a `asistente`.
- Puede abandonar su propio rol de asistente (pasar su propia inscripción a `usuario` o salir por su cuenta según el flujo habilitado).

De acuerdo con la lógica actual, el asistente **no tiene control global** del evento y sus acciones están restringidas frente a las de un organizador o un admin.
