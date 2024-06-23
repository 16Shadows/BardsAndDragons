# Образ для всех этапов
ARG IMAGE=node:22.2-alpine


# === Сборка сервера ===
FROM $IMAGE as build-server

# Корневая папка
WORKDIR app

# Зависимости
COPY *.json .
RUN npm ci

# Сборка
COPY src ./src
RUN npm run build-docker

# Переменные
COPY .env ./dist


# === Сборка клиента ===
FROM $IMAGE as build-client

WORKDIR app

COPY ./client/*.json .
RUN npm ci

COPY ./client/src ./src
COPY ./client/public ./public
RUN npm run build


# === Финал ===
FROM $IMAGE

# Метаданные
LABEL Author="Bards and dragons team"
LABEL type="main app"

# Корневая папка
WORKDIR app

# Зависимости
COPY *.json .
RUN npm ci && npm cache clean --force

# Копируем файлы с предыдущих этапов
COPY --from=build-server /app/dist .
COPY --from=build-client /app/build ./public

# Предполагаемый порт
EXPOSE 3000

# Запуск сервера
ENTRYPOINT ["node", "--env-file=.env", "app.js"]