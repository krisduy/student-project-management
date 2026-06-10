FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development

COPY package*.json ./
RUN npm ci

EXPOSE 5174

CMD ["npm", "run", "watch", "--", "--port", "5174"]
