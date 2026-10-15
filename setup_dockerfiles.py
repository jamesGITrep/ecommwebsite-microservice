import os

services = [
    "api-gateway",
    "catalog-service",
    "customer-service",
    "marketing-service",
    "order-service",
    "payment-service"
]

dockerfile_content = """FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Run prisma generate if schema exists
RUN if [ -d "prisma" ]; then npx prisma generate; fi
EXPOSE 4000 4001 4002 4003 4004 4005
# Using sh -c to push db and start
CMD sh -c "if [ -d 'prisma' ]; then npx prisma db push; fi && npx ts-node index.ts"
"""

dockerignore_content = """node_modules
.env
"""

for service in services:
    with open(f"./{service}/Dockerfile", "w") as f:
        f.write(dockerfile_content)
    with open(f"./{service}/.dockerignore", "w") as f:
        f.write(dockerignore_content)

frontend_dockerfile = """FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
"""

with open("./E-Com Website/Dockerfile", "w") as f:
    f.write(frontend_dockerfile)
with open("./E-Com Website/.dockerignore", "w") as f:
    f.write(dockerignore_content)

print("Dockerfiles created")
