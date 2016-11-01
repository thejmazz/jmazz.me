FROM node:6.2.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./package.json /usr/src/app
RUN npm install

COPY . /usr/src/app

RUN groupadd -r app && useradd -r -g app app
RUN chown -R app:app /usr/src/app
USER app

ENV NODE_ENV production
ARG SSR_HOST=http://localhost
ARG SSR_PORT=3001

ENV SSR_HOST $SSR_HOST
ENV SSR_PORT $SSR_PORT

RUN npm run bundle

EXPOSE $SSR_PORT

CMD node ./src/server.js
