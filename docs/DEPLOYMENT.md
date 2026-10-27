# Развёртывание приложения — Клинический компас

## Содержание
- [Развёртывание на облачном сервере (Ubuntu)](#развёртывание-на-облачном-сервере-ubuntu)
- [Развёртывание локально](#развёртывание-локально)
- [Настройка SSL/HTTPS](#настройка-sslhttps)
- [Мониторинг и логирование](#мониторинг-и-логирование)

## Развёртывание на облачном сервере (Ubuntu)

### Предварительные требования

- Ubuntu 20.04+ / 22.04+
- Root или sudo доступ
- Открытый порт 3001 (или другой для backend)
- Git

### 1. Подключение к серверу

```bash
ssh root@ваш-ip-адрес
```

### 2. Установка Docker и Docker Compose

```bash
# Обновление системы
apt update && apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Добавление пользователя в группу docker
usermod -aG docker root

# Установка Docker Compose v2 (совместим с Python 3.12)
apt install -y python3-setuptools
curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Проверка версий
docker --version
docker-compose --version
```

### 3. Клонирование репозитория

```bash
mkdir -p /opt
cd /opt
git clone https://github.com/ResonanceTECH/SechHack_26.git
cd SechHack_26
```

### 4. Настройка переменных окружения

```bash
cd backend
cp .env.example .env
nano .env
```

Обязательные переменные:
```
SECRET_KEY=<случайная строка минимум 32 символа>
POSTGRES_USER=sechhack
POSTGRES_PASSWORD=<сложный пароль>
POSTGRES_DB=sechhack
CORS_ORIGINS=http://ваш-ip:3001,http://ваш-ip
```

Генерация SECRET_KEY:
```bash
openssl rand -hex 32
```

### 5. Запуск приложения

```bash
cd /opt/SechHack_26
docker-compose up -d
```

### 6. Миграции БД

```bash
docker-compose exec backend alembic upgrade head
```

### 7. Начальные данные (опционально)

```bash
docker-compose exec backend python seed.py
```

### 8. Проверка статуса

```bash
docker-compose ps
docker-compose logs backend
```

### 9. Доступ к приложению

- Backend API: http://ваш-ip:3001
- Swagger Docs: http://ваш-ip:3001/docs
- Health check: http://ваш-ip:3001/health

### 10. Управление сервисами

```bash
# Остановка сервисов
docker-compose down

# Остановка с удалением данных БД
docker-compose down -v

# Просмотр логов
docker-compose logs -f backend

# Перезапуск
docker-compose restart backend
```

## Развёртывание локально

### Требования

- Docker Desktop (Mac/Windows) или Docker + Docker Compose (Linux)
- Node.js 18+ (для фронтенда)
- Python 3.11+ (для бэкенда без Docker)

### Способ 1: Docker Compose (рекомендуется)

```bash
cd SechHack_26
cp backend/.env.example backend/.env
# Отредактируйте .env
docker-compose up -d
```

### Способ 2: Раздельный запуск (для разработки)

#### Инфраструктура

```bash
docker-compose up -d postgres redis
```

#### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
alembic upgrade head
python seed.py  # опционально
uvicorn app.main:app --reload --port 3001
```

#### Frontend (веб-кабинет)

```bash
cd frontend
npm install
npm run dev
```

#### Mobile (приложение пациента)

```bash
cd mobile
npm install
npm start
```

См. подробнее в [README.MD](../README.MD) раздел 5.

## Настройка SSL/HTTPS

### Для production обязательно использовать HTTPS

#### Способ 1: Nginx + Let's Encrypt

```bash
# Установка Nginx и Certbot
apt install -y nginx certbot python3-certbot-nginx

# Получение сертификата
certbot --nginx -d ваш-домен.com

# Автоматическое обновление
certbot renew --dry-run
```

Конфигурация Nginx (`/etc/nginx/sites-available/clinical-compass`):
```nginx
server {
    listen 80;
    server_name ваш-домен.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name ваш-домен.com;

    ssl_certificate /etc/letsencrypt/live/ваш-домен.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ваш-домен.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Способ 2: Cloudflare SSL (проще)

1. Добавьте домен в Cloudflare
2. Установите режим "Full" в SSL/TLS
3. Cloudflare предоставит бесплатный SSL
4. Настройте DNS для домена на IP сервера

## Мониторинг и логирование

### Просмотр логов

```bash
# Все сервисы
docker-compose logs

# Только backend
docker-compose logs -f backend

# Только postgres
docker-compose logs postgres
```

### Мониторинг контейнеров

```bash
# Статус всех контейнеров
docker-compose ps

# Ресурсы контейнеров
docker stats
```

### Автоматический перезапуск

Docker Compose уже настроен на автоматический перезапуск (`restart: unless-stopped` в docker-compose.yml).

### Резервное копирование БД

```bash
# Резервное копирование
docker exec cc-postgres pg_dump -U sechhack sechhack > backup_$(date +%Y%m%d).sql

# Восстановление
cat backup_20261027.sql | docker exec -i cc-postgres psql -U sechhack sechhack
```

Настройте cron для автоматического бэкапа:
```bash
crontab -e
```

Добавить строку (ежедневно в 2:00 ночи):
```
0 2 * * * docker exec cc-postgres pg_dump -U sechhack sechhack > /backups/sechhack_$(date +\%Y\%m\%d).sql
```

## Troubleshooting

### Порт уже занят

Если порт 3001 занят:
```bash
# Измените PORT в docker-compose.yml
# или остановите conflicting service
lsof -i :3001
```

### Ошибка миграций

```bash
# Сброс миграций (удаляет все данные!)
docker-compose down -v
docker-compose up -d
docker-compose exec backend alembic upgrade head
```

### Проблемы с памятью

Если сервер имеет мало RAM, уменьшите в docker-compose.yml:
```yaml
postgres:
  environment:
    POSTGRES_HOST_AUTH_METHOD: trust
```

Или уменьшите DB_POOL_SIZE в .env.

### Ошибка подключения к БД

```bash
# Проверьте статус postgres
docker-compose ps postgres
docker-compose logs postgres

# Перезапустите postgres
docker-compose restart postgres
```

## Безопасность

### Файрwall (UFW)

```bash
apt install -y ufw
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3001/tcp  # Backend API (опционально, если без Nginx)
ufw enable
```

### Смена порта по умолчанию SSH

```bash
# Измените порт в /etc/ssh/sshd_config
# Port 2222
systemctl restart sshd
ufw allow 2222/tcp
```

### Регулярные обновления

```bash
apt update && apt upgrade -y
docker-compose pull
docker-compose up -d
```

## Обновление приложения

```bash
cd /opt/SechHack_26
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
docker-compose exec backend alembic upgrade head
```
