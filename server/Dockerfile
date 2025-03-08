FROM node:alpine AS build

WORKDIR /server

COPY "package*.json" /server/

RUN ["/bin/sh", "-c", "npm install"]

COPY . /server/

CMD ["node", "server.js"]
