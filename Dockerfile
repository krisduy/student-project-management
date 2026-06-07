FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY . .

WORKDIR /app/server

EXPOSE 3000

CMD ["npm", "start"]
