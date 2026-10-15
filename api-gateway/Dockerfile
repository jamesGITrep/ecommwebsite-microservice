FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install -g tsx
COPY . .
EXPOSE 4000
CMD ["tsx", "index.ts"]
