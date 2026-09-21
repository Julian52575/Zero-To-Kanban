# Dev-mode image for the Express/Prisma API that lives in ./backend.
# Runs nodemon with hot reload; not a production build.

FROM node:24-slim

WORKDIR /app
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]
