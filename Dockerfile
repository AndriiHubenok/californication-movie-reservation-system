FROM python:3.12-slim

# Запобігає створенню .pyc та буферизації логів
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# 1. Системні залежності для GDAL/GEOS встановлюємо ПЕРЕД pip
RUN apt-get update && apt-get install -y --no-install-recommends \
    binutils \
    libproj-dev \
    gdal-bin \
    libgdal-dev \
    && rm -rf /var/lib/apt/lists/*

# 2. Встановлення Python-залежностей
RUN pip install --upgrade pip
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# 3. Копіювання коду
COPY . /app/