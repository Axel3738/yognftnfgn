FROM node:20-alpine
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
