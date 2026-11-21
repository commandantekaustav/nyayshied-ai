# NyayShield AI — Cloud Run Production Dockerfile (Root)
# Deploy directly to Google Cloud Run:
#   gcloud run deploy nyayshield-backend --source . --region asia-south1 --allow-unauthenticated

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

# Install runtime dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source (never bake .env secrets into the image)
COPY backend ./backend
RUN rm -f ./backend/.env

EXPOSE 8080

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
