FROM oven/bun:debian AS builder
ENV NODE_ENV production

WORKDIR /app

COPY --from=frontend package.json .
RUN bun install

COPY --from=frontend public/ /app/public
COPY --from=frontend src/ /app/src
COPY --from=frontend index.html .
COPY --from=frontend postcss.config.cjs .
COPY --from=frontend tailwind.config.cjs .

COPY --from=frontend tsconfig.json .
COPY --from=frontend tsconfig.node.json .
COPY --from=frontend tsconfig.app.json .

COPY --from=frontend vite.config.ts .

RUN bun run build --base ./

# Gzip the build
RUN gzip -9 -k -r /app/dist

FROM nginx:alpine AS production
ENV NODE_ENV production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]