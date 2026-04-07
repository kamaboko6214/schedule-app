FROM node:20-alpine

WORKDIR /app

COPY package.json .

# ビルド時
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]