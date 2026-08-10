FROM node:20-alpine
EXPOSE 3000
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .
RUN npx prisma generate && npm run build

# Migrationer körs vid start så att en deploy aldrig hamnar före schemat.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
