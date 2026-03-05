# ===== MULTI-STAGE BUILD =====

# ✅ STAGE 1: BUILD (Node 20+ para Vite)
FROM node:20-alpine AS builder

# ✅ Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

WORKDIR /app

# ✅ Copiar package files primeiro (para cache)
COPY package*.json ./

# ✅ Instalar TODAS as dependências (incluindo devDependencies para build)
RUN npm ci && npm cache clean --force

# ✅ Copiar código fonte
COPY . .

# ✅ Build da aplicação Vue com Vuetify
RUN npm run build

# ===== STAGE 2: PRODUCTION =====
FROM nginx:alpine

# ✅ Instalar wget para health check
RUN apk add --no-cache wget

# ✅ Copiar build para nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# ✅ Configuração nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ✅ Expor porta
EXPOSE 80

# ✅ Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]