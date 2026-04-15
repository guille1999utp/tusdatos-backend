# Backend - Mis Eventos

API REST construida con FastAPI para gestionar eventos, autenticación y registro de asistentes.

## Stack

- Python 3.12
- FastAPI + SQLAlchemy
- PostgreSQL
- Alembic
- JWT
- Pytest

## Configuración

1. Copia variables de entorno:

```bash
cp .env.example .env
```

Si vas a usar Neon, reemplaza `SQLALCHEMY_DATABASE_URL` en `.env` por tu cadena SSL.

2. Instala dependencias (pip):

```bash
pip install -r requirements.txt
```

3. O instala con Poetry:

```bash
poetry install
```

4. Ejecuta migraciones:

```bash
alembic upgrade head
```

5. Inicia la API:

```bash
uvicorn main:app --reload
```

## Testing

```bash
python -m pytest --cov=.
```

## Documentación de API

- Swagger/OpenAPI: [http://localhost:8000/docs](http://localhost:8000/docs)

## Base de datos (Neon)

- Ejemplo de conexión compatible:
  - `postgresql://<user>:<password>@<host>/<database>?sslmode=require&channel_binding=require`
- Para migraciones con Alembic se usa automáticamente la URL de `SQLALCHEMY_DATABASE_URL` definida en `.env`.

## Endpoints principales

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/list/users`
- `GET /event/`
- `GET /event/my-events`
- `GET /event/my-events-registers`
- `GET /event/search/by-title`
- `GET /event/{event_id}/sessions`
- `POST /event/{event_id}/sessions`
- `POST /event/`
- `PUT /event/{event_id}`
- `DELETE /event/{event_id}`
- `POST /event/{event_id}` (registro del usuario autenticado como invitado)