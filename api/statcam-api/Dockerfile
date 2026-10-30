# StatCam backend — FastAPI pipeline (ingest -> SAM 3.1 -> Spark -> E2B).
FROM python:3.11-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /srv
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ ./app/
# /data holds uploads + job state (mount a volume in production)
RUN mkdir -p /data/uploads /data/jobs
ENV DATA_DIR=/data
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
