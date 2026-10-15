const fs = require('fs');

const services = [
    { name: "api-gateway", port: 4000, hasPrisma: false, hasSeed: false },
    { name: "catalog-service", port: 4001, hasPrisma: true, hasSeed: true },
    { name: "customer-service", port: 4003, hasPrisma: true, hasSeed: true },
    { name: "marketing-service", port: 4004, hasPrisma: true, hasSeed: false },
    { name: "order-service", port: 4002, hasPrisma: true, hasSeed: false },
    { name: "payment-service", port: 4005, hasPrisma: true, hasSeed: false }
];

const dockerignoreContent = `node_modules
.env
dist
.git
`;

for (const svc of services) {
    let cmd = `CMD ["tsx", "index.ts"]`;
    if (svc.hasPrisma) {
        if (svc.hasSeed) {
            cmd = `CMD sh -c "until npx prisma db push --accept-data-loss; do echo 'Waiting for database...'; sleep 2; done; tsx prisma/seed.ts; tsx index.ts"`;
        } else {
            cmd = `CMD sh -c "until npx prisma db push --accept-data-loss; do echo 'Waiting for database...'; sleep 2; done; tsx index.ts"`;
        }
    }

    const dockerfile = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install -g tsx
COPY . .
${svc.hasPrisma ? 'RUN npx prisma generate\n' : ''}EXPOSE ${svc.port}
${cmd}
`;

    fs.writeFileSync(`./${svc.name}/Dockerfile`, dockerfile);
    fs.writeFileSync(`./${svc.name}/.dockerignore`, dockerignoreContent);
}

console.log("Optimized Dockerfiles created for all backend services.");
