FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g turbo

COPY . .
RUN turbo prune web --docker

FROM node:20-alpine AS installer
WORKDIR /app
COPY --from=base /app/out/json/ .
COPY --from=base /app/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=base /app/out/full/ .
RUN turbo run build --filter=web...

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=installer /app .

WORKDIR /app/apps/web
EXPOSE 3002
ENV PORT=3002
CMD ["npm", "run", "start", "--", "--port", "3002"]
