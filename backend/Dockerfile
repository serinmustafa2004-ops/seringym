FROM node:22-alpine AS build

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/tsconfig.json ./
COPY backend/src ./src
COPY backend/scripts ./scripts
COPY database ./database

RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/database ./database

ENV PORT=4000

EXPOSE 4000

CMD ["sh", "-c", "npm run init-db && npm run start"]
