FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g turbo

COPY . .
RUN turbo prune admin --docker

FROM node:20-alpine AS installer
WORKDIR /app
COPY --from=base /app/out/json/ .
COPY --from=base /app/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=base /app/out/full/ .
RUN turbo run build --filter=admin...

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=installer /app .

WORKDIR /app/apps/admin
EXPOSE 3001
CMD ["npm", "run", "start"]
