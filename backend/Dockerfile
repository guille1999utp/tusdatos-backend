FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Sin script .sh externo: en Windows los CRLF rompen el shebang en Linux ("no such file or directory").
ENTRYPOINT ["/bin/sh", "-c", "set -e && cd /app && alembic upgrade head && python scripts/seed_admin.py && exec uvicorn main:app --host 0.0.0.0 --port 8000"]