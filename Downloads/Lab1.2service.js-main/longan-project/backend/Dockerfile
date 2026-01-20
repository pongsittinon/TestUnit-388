# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# ใช้ npm install แทน npm ci เพื่อป้องกัน error
RUN npm install
COPY . .

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./

RUN mkdir -p logs

# Healthcheck ตามเอกสารหน้า 9
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/demo || exit 1

EXPOSE 3000
CMD ["node", "service.js"]