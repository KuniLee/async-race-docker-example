FROM node as builder

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

FROM node

COPY ./package.json ./server.js .

RUN npm install express

COPY --from=builder ./app/dist ./dist

EXPOSE 3333

CMD ["node","server"]