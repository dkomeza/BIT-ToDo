FROM oven/bun:debian

WORKDIR /app

COPY package.json .
RUN bun install

COPY src ./src
COPY tsconfig.json .

# Cat the .env file
RUN echo "DB_HOST=BIT-ToDo-DB" > .env

CMD ["bun", "start"]