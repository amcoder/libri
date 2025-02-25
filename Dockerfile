FROM node:22-alpine AS builder

WORKDIR /build

COPY package*.json tsconfig.json app.config.ts vite.config.ts ./
COPY app ./app

RUN npm install
RUN npm run build

FROM node:22-alpine AS release

WORKDIR /app
COPY --from=builder /build/.output ./

CMD ["node", "server/index.mjs"]
