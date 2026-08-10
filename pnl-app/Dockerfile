# Debian, inte Alpine: Prismas motor länkar mot OpenSSL/glibc och kraschar på
# musl med "Could not parse schema engine response".
FROM node:20-slim
RUN apt-get update -qq && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
EXPOSE 3000

COPY package.json package-lock.json* ./
# Byggsteget behöver devDependencies (vite, remix, prisma CLI, tsc).
# De rensas bort efter bygget istället för att uteslutas före.
RUN npm install --include=dev --no-audit --no-fund

COPY . .
RUN npx prisma generate && npm run build
RUN npm prune --omit=dev

ENV NODE_ENV=production
# Migrationer körs vid start så att en deploy aldrig hamnar före schemat.
CMD ["sh", "-c", "npx prisma migrate deploy && exec npm run start"]
