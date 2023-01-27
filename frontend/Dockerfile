FROM node:current-alpine3.17 as builder

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

FROM node:current-alpine3.17

COPY ./package.json ./server.js .

RUN npm install express

COPY --from=builder ./app/dist ./dist

EXPOSE 3333

CMD ["node","server"]