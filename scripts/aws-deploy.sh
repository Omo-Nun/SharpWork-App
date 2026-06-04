#!/usr/bin/env bash
# AWS af-south-1 deployment guide — run after docker images are pushed to GHCR/ECR
set -euo pipefail

echo "SharpWork AWS Deployment (af-south-1)"
echo "======================================"
echo ""
echo "1. Provision RDS PostgreSQL 15 with PostGIS extension enabled"
echo "2. Provision ElastiCache Redis 7 cluster"
echo "3. Create ECR repos: sharpwork-api, sharpwork-web, sharpwork-admin"
echo "4. Push images:"
echo "     docker tag ghcr.io/ORG/sharpwork/api:latest ACCOUNT.dkr.ecr.af-south-1.amazonaws.com/sharpwork-api:latest"
echo "     docker push ACCOUNT.dkr.ecr.af-south-1.amazonaws.com/sharpwork-api:latest"
echo "5. Create ECS Fargate services behind ALB:"
echo "     - api.sharpwork.com  -> api:4000"
echo "     - sharpwork.com      -> web:3002"
echo "     - admin.sharpwork.com -> admin:3001"
echo "6. Run migrations: docker run --rm -e DATABASE_URL=... sharpwork-api npx prisma migrate deploy"
echo "7. Configure Paystack webhook: https://api.sharpwork.com/webhooks/paystack"
echo "8. Run: npm run deploy:checklist (with production env loaded)"
echo ""
echo "See .env.production.example for required environment variables."
