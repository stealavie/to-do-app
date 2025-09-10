# Deployment Guide

This guide covers different deployment options for the Collaborative Learning Platform Backend.

## 🚀 Quick Start (Local Development)

1. **Prerequisites**:
   - Node.js 20+
   - PostgreSQL 16+
   - Docker (optional, for PostgreSQL)

2. **Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env file with your database credentials
   ```

3. **Database Setup**:
   ```bash
   # Option 1: Use Docker
   docker-compose up -d postgres
   
   # Option 2: Use local PostgreSQL
   # Create database manually and update DATABASE_URL in .env
   ```

4. **Run Migrations and Seed**:
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 🌐 Production Deployment

### Option 1: Railway (Recommended)

Railway provides easy PostgreSQL and Node.js hosting.

1. **Setup Railway**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Create Project**:
   ```bash
   railway new
   cd your-project
   ```

3. **Add PostgreSQL**:
   ```bash
   railway add postgresql
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

5. **Set Environment Variables**:
   ```bash
   railway variables set JWT_SECRET=your-super-secret-key
   railway variables set NODE_ENV=production
   ```

### Option 2: Heroku

1. **Create Heroku App**:
   ```bash
   heroku create your-app-name
   ```

2. **Add PostgreSQL**:
   ```bash
   heroku addons:create heroku-postgresql:essential-0
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set JWT_SECRET=your-super-secret-key
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

5. **Run Migrations**:
   ```bash
   heroku run npm run db:migrate
   ```

### Option 3: DigitalOcean App Platform

1. **Create `app.yaml`**:
   ```yaml
   name: collaborative-learning-backend
   services:
   - name: api
     source_dir: /
     github:
       repo: your-username/your-repo
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: NODE_ENV
       value: production
     - key: JWT_SECRET
       value: your-super-secret-key
   databases:
   - name: db
     engine: PG
     version: "13"
   ```

2. **Deploy via DigitalOcean Console** or:
   ```bash
   doctl apps create --spec app.yaml
   ```

### Option 4: AWS (Advanced)

#### Using AWS Lambda + RDS

1. **Install Serverless Framework**:
   ```bash
   npm install -g serverless
   npm install serverless-offline
   ```

2. **Create `serverless.yml`**:
   ```yaml
   service: collaborative-learning-api
   
   provider:
     name: aws
     runtime: nodejs18.x
     region: us-east-1
     environment:
       DATABASE_URL: ${env:DATABASE_URL}
       JWT_SECRET: ${env:JWT_SECRET}
   
   functions:
     api:
       handler: dist/server.handler
       events:
         - http:
             path: /{proxy+}
             method: ANY
             cors: true
   
   plugins:
     - serverless-offline
   ```

3. **Deploy**:
   ```bash
   serverless deploy
   ```

## 🐳 Docker Deployment

### Single Container

1. **Create `Dockerfile`**:
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. **Build and Run**:
   ```bash
   docker build -t collaborative-learning-backend .
   docker run -p 3000:3000 --env-file .env collaborative-learning-backend
   ```

### Docker Compose (Full Stack)

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/collaborative_learning_db
      - JWT_SECRET=your-super-secret-key
      - NODE_ENV=production
    depends_on:
      - postgres
    networks:
      - app-network

  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: collaborative_learning_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
```

## 🔧 Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-use-long-random-string"
JWT_EXPIRES_IN="7d"

# Server
NODE_ENV="production"
PORT=3000

# Security (Optional)
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
FRONTEND_URL="https://yourdomain.com"
```

### Generating Secure JWT Secret

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 64

# Option 3: Using online generator (not recommended for production)
```

## 📊 Monitoring & Logging

### Basic Health Monitoring

The API includes a health check endpoint at `/health` that returns:

```json
{
  "status": "OK",
  "timestamp": "2025-09-10T07:38:46.876Z",
  "environment": "production"
}
```

### Recommended Monitoring Tools

- **Uptime**: Pingdom, StatusCake, or UptimeRobot
- **Error Tracking**: Sentry, Rollbar, or Bugsnag
- **Performance**: New Relic, DataDog, or AppDynamics
- **Logs**: LogRocket, Papertrail, or CloudWatch

### Adding Sentry (Error Tracking)

1. **Install**:
   ```bash
   npm install @sentry/node @sentry/profiling-node
   ```

2. **Configure** in `server.ts`:
   ```typescript
   import * as Sentry from "@sentry/node";
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

## 🔒 Security Checklist

### Production Security

- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (TLS/SSL)
- [ ] Set secure JWT secret (min 64 characters)
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Use security headers (Helmet.js)
- [ ] Keep dependencies updated
- [ ] Use strong database passwords
- [ ] Restrict database access
- [ ] Enable database SSL
- [ ] Set up proper logging
- [ ] Configure firewall rules
- [ ] Use least privilege access

### Security Headers Example

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 🚀 Performance Optimization

### Production Optimizations

1. **Enable Gzip Compression**:
   ```bash
   npm install compression
   ```
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

2. **Database Indexing**:
   ```prisma
   model User {
     @@index([email])
     @@index([username])
   }
   
   model GroupMembership {
     @@index([userId])
     @@index([groupId])
   }
   ```

3. **Connection Pooling**:
   ```typescript
   const prisma = new PrismaClient({
     datasources: {
       db: {
         url: process.env.DATABASE_URL + "?connection_limit=20&pool_timeout=20"
       }
     }
   });
   ```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd backend
        npm ci
        
    - name: Run tests
      run: |
        cd backend
        npm test
        
    - name: Build
      run: |
        cd backend
        npm run build
        
    - name: Deploy to Railway
      run: |
        npm install -g @railway/cli
        railway deploy
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 📚 Additional Resources

- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/production-best-practices)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
