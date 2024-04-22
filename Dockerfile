FROM oven/bun

WORKDIR /home/bun/app

COPY package.json .
COPY bun.lockb .

RUN bun install --production

COPY src src
COPY tsconfig.json .
# COPY public public

ENV NODE_ENV production
CMD ["bun", "start"]

EXPOSE 9000
