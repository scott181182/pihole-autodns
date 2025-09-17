FROM docker.io/nginxproxy/docker-gen:0.15.1-debian AS docker-gen

FROM docker.io/nginxproxy/forego:0.18.4-debian AS forego

FROM oven/bun:1.2.22-debian AS build

WORKDIR /build
COPY ./package.json ./tsconfig.json ./bun.lock /build/
RUN bun install

COPY ./src /build/src
RUN bun run build

FROM oven/bun:1.2.22-debian

ENV DOCKER_HOST=unix:///tmp/docker.sock \
    DATA_DIRECTORY=/app/data

# Install Forego + docker-gen
COPY --from=forego /usr/local/bin/forego /usr/local/bin/forego
COPY --from=docker-gen /usr/local/bin/docker-gen /usr/local/bin/docker-gen

WORKDIR /app
COPY ./templates /etc/docker-gen/templates
COPY ./app /app
COPY --from=build /build/dist/index.js /app/index.js
RUN mkdir "$DATA_DIRECTORY"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["forego", "start"]
