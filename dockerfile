FROM node:22.17.1-alpine

WORKDIR /usr/src

COPY package*.json prisma ./

RUN npm ci
RUN npx prisma generate

EXPOSE 3000

COPY . .

CMD ["npm", "run", "start:dev"]