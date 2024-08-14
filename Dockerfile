FROM node:18-alpine AS base

FROM base as dependecies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base as builder

WORKDIR /app
COPY --from=dependecies /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM busybox as server

WORKDIR /app
COPY --from=builder /app/dist* ./

ENTRYPOINT ["busybox", "httpd", "-f", "-v", "-p", "3000"]

EXPOSE 3000
