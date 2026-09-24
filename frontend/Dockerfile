FROM node:24-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci \
 && npm i -g serve

COPY . .
RUN npm run build
EXPOSE 3000

CMD [ "serve", "-s", "dist" ]