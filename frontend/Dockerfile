FROM node

WORKDIR /front

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3333

CMD ["node","server"]