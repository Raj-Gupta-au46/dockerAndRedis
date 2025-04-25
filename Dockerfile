FROM node:iron

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 6379
EXPOSE 5000

CMD ["npm", "run", "dev"]