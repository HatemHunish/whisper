FROM oven/bun:latest

WORKDIR /app

# build web frontend
WORKDIR /app/web
COPY web/package.json web/bun.lock* ./
RUN bun install --frozen-lockfile
COPY web/ ./
RUN bun run build

# install backend dependencies
WORKDIR /app/backend
COPY backend/package.json backend/bun.lock* ./
RUN bun install --frozen-lockfile
COPY backend/ ./

# expose port
EXPOSE 3000
# start non-sensetive defaults
ENV PORT=3000
ENV NODE_ENV=production
CMD ["bun", "index.ts"]