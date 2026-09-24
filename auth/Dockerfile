# Build the Express/Prisma login service that lives in ./auth.
#
#   npm ci in a builder stage, generate the Prisma client, then copy just
#   node_modules + src + prisma into a slim runtime image. The service listens
#   on :4000 and is routed by Traefik. `prisma migrate deploy` runs on
#   container start so the schema is applied against the `authdb` service
#   before the app starts serving requests.
#
# `npm ci` needs auth/package-lock.json -- run `cd auth && npm install` once
# after checkout to generate it (same bootstrap step as ./backend).

FROM node:24-slim AS build
WORKDIR /app
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate

FROM node:24-slim
WORKDIR /app
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
COPY src ./src
USER node
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
