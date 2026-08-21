# SSRF API7:2023 Exercise Container Environment
FROM python:3.12-slim

ENV EXERCISE_ID=ex-ssrf-01
ENV OWASP_CATEGORY=API7:2023
ENV PORT=8000

WORKDIR /app

COPY server/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY server /app/server

WORKDIR /app/server

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
