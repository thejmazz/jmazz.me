FROM ubuntu:16.04

RUN apt-get update && apt-get upgrade -y && apt-get install curl -y

RUN curl https://getcaddy.com | bash

RUN groupadd -r caddy && useradd -r -g caddy caddy && mkdir -p /home/caddy

COPY ./caddy/Caddyfile /home/caddy
COPY ./build /var/www

RUN chown -R caddy:caddy /home/caddy
RUN chown -R caddy:caddy /var/www

USER caddy
WORKDIR /home/caddy

ENTRYPOINT [ "caddy" ]
