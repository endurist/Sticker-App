# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create health check script
RUN echo '#!/usr/bin/env python3\nimport socket\n\nsock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\nresult = sock.connect_ex(("127.0.0.1", 8000))\nsock.close()\nexit(0 if result == 0 else 1)' > /app/healthcheck.py && chmod +x /app/healthcheck.py

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app && chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check using Python
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python3 /app/healthcheck.py

# Run the application
CMD ["python", "main.py"]
