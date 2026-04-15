# Mis Eventos (tusdatos)

Aplicación full stack: API **FastAPI** + SPA **React/Vite**, con **PostgreSQL**. Este documento describe cómo levantar todo con **Docker** y **Docker Compose**.

## Requisitos

- [Docker Engine](https://docs.docker.com/engine/install/) y plugin **Docker Compose V2** (`docker compose`, no obligatorio el binario antiguo `docker-compose`).
- En Windows, **Docker Desktop** cumple ambos.

## Qué levanta `docker-compose.yml`

| Servicio   | Imagen / build      | Puerto host | Descripción |
|-----------|---------------------|-------------|-------------|
| `db`      | `postgres:16-alpine` | **5432**    | Base de datos `miseventos`. |
| `backend` | build `./backend`  | **8000**    | API Uvicorn (`main:app`). |
| `frontend` | build `./frontend` | **5173** → nginx **80** en contenedor | SPA estática servida por nginx. |

La URL de base de datos dentro de Docker usa el hostname del servicio: `db:5432`.

## 1. URL del API en el frontend (importante)

La variable **`VITE_PUBLIC_API_URL`** se define en **tiempo de build** de Vite. En Docker viene fijada por defecto en `docker-compose.yml` (`build.args` del servicio `frontend`) como `http://localhost:8000/`. El navegador debe poder alcanzar esa URL (misma máquina o la IP/host público del servidor).

Para otro host o puerto del API, edita en `docker-compose.yml` el bloque:

```yaml
frontend:
  build:
    args:
      VITE_PUBLIC_API_URL: http://localhost:8000/
```

y luego ejecuta `docker compose build frontend` de nuevo.

Si desarrollas el frontend **fuera** de Docker, sigue usando `frontend/.env` (puedes copiar `frontend/.env.example`).

## 2. Construir imágenes y arrancar contenedores

En la **raíz del repositorio** (donde está `docker-compose.yml`):

```bash
docker compose build --no-cache
docker compose up -d
```

La primera vez, PostgreSQL puede tardar unos segundos; el `backend` espera a que `db` esté **healthy** gracias al healthcheck del compose.

## 3. Migraciones y usuario administrador (automático)

Cada vez que arranca el contenedor `backend`, el `ENTRYPOINT` del Dockerfile ejecuta en cadena:

1. Ejecuta **`alembic upgrade head`** (esquema al día).
2. Ejecuta **`python scripts/seed_admin.py`**: crea el admin solo si no existe ya un usuario con ese email (es idempotente).
3. Inicia **Uvicorn**.

No hace falta correr migraciones a mano la primera vez. Si quieres repetir solo migraciones:

```bash
docker compose exec backend alembic upgrade head
```

### Credenciales por defecto del admin

Definidas en `docker-compose.yml` (variables `SEED_ADMIN_*`). Por defecto:

| Campo | Valor |
|--------|--------|
| Email | `admin@miseventos.com` |
| Contraseña | `Admin123!` |

Cámbialas antes de desplegar en un entorno real.

## 4. Comprobar que todo responde

- **API (documentación):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Frontend:** [http://localhost:5173](http://localhost:5173)

## 5. Reconstruir tras cambios en código

```bash
docker compose build backend frontend
docker compose up -d
```

Si cambias solo variables de entorno del `docker-compose.yml`, suele bastar:

```bash
docker compose up -d --force-recreate backend
```

Si cambias **`VITE_PUBLIC_API_URL`**, debes **reconstruir el frontend** (`docker compose build frontend`).

## 6. Variables de entorno del backend en Docker

En `docker-compose.yml` ya se definen valores por defecto:

- `SQLALCHEMY_DATABASE_URL` apuntando a `db`.
- `SECRET_KEY` (cámbiala en entornos reales).
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME` (usuario admin inicial; ver sección 3).

Para secretos en producción, usa un fichero `docker compose` con `env_file` o variables del host; no subas `.env` con claves reales al repositorio.

## 7. Desarrollo local sin Docker

Consulta `backend/README.md` y `frontend/README.md` para instalar dependencias, variables `.env` y ejecutar Uvicorn / Vite en la máquina host.
