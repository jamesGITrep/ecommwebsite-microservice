const fs = require('fs');
const path = require('path');

const frontends = [
    { name: 'frontend-products', base: '/' },
    { name: 'frontend-search', base: '/search/' },
    { name: 'frontend-cart', base: '/cart/' },
    { name: 'frontend-payment', base: '/payment/' }
];

const dockerfileContent = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
`;

const dockerignoreContent = `node_modules
dist
.env
.git
`;

frontends.forEach(app => {
    const dir = path.join(__dirname, app.name);
    
    // Create Dockerfile
    fs.writeFileSync(path.join(dir, 'Dockerfile'), dockerfileContent);
    // Create .dockerignore
    fs.writeFileSync(path.join(dir, '.dockerignore'), dockerignoreContent);
    
    // Update vite.config.ts to set the base path and preview allowedHosts
    const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '${app.base}',
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true
  }
})
`;
    fs.writeFileSync(path.join(dir, 'vite.config.ts'), viteConfig);
});

console.log("Vite micro-frontends configured successfully with alpine and allowedHosts.");
