FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then((res) => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["npm", "run", "dev"]
