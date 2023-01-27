FROM node:current-alpine3.17

WORKDIR /server

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node","index"]