FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install -g tsx
COPY . .
RUN npx prisma generate
EXPOSE 4005
CMD sh -c "until npx prisma db push --accept-data-loss; do echo 'Waiting for database...'; sleep 2; done; tsx index.ts"
