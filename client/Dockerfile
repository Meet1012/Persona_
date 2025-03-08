FROM node:alpine AS builder

WORKDIR /app

COPY ["package*.json", "/app/"] 

RUN ["/bin/sh","-c","npm install"]

COPY . /app/

EXPOSE 5173

RUN [ "npm", "run", "build"]

COPY src/assets /app/dist/assets/

# CMD [ "npm", "run", "dev" ]

FROM nginx

COPY --from=builder  /app/dist/ /usr/share/nginx/html
