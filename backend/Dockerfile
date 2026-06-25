FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
# Instalar OpenSSL que es necesario para Prisma
RUN apt-get update -y && apt-get install -y openssl
RUN npm install
COPY prisma ./prisma
RUN npx prisma generate
COPY . .

FROM node:20-slim
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "start"]
