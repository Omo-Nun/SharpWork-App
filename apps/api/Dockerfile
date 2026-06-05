FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies for turborepo
RUN npm install -g turbo

# Prune the workspace for the api
COPY . .
RUN turbo prune api --docker

FROM node:20-alpine AS installer
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=base /app/out/json/ .
COPY --from=base /app/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=base /app/out/full/ .
RUN npx turbo run build --filter=api...

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl

COPY --from=installer /app .

WORKDIR /app/apps/api
EXPOSE 4000
RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
