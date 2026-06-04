#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== SharpWork Production Launch Checklist ==="

required_vars=(
  DATABASE_URL
  REDIS_URL
  JWT_ACCESS_SECRET
  JWT_REFRESH_SECRET
  WEB_APP_URL
  API_PUBLIC_URL
)

missing=0
for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "✗ Missing env: $var"
    missing=1
  else
    echo "✓ $var is set"
  fi
done

if [[ $missing -eq 1 ]]; then
  echo "Set required variables (see .env.production.example) before launch."
  exit 1
fi

API_URL="${API_PUBLIC_URL:-http://localhost:4000}"
WEB_URL="${WEB_APP_URL:-http://localhost:3002}"

echo ""
echo "Checking API health at $API_URL/health ..."
health=$(curl -sf "$API_URL/health" || true)
if echo "$health" | grep -q '"status":"ok"'; then
  echo "✓ API health OK"
else
  echo "✗ API health check failed"
  exit 1
fi

echo "Checking web app at $WEB_URL ..."
if curl -sf -o /dev/null "$WEB_URL"; then
  echo "✓ Web app reachable"
else
  echo "✗ Web app unreachable"
  exit 1
fi

echo ""
echo "Optional integrations:"
[[ -n "${PAYSTACK_SECRET_KEY:-}" ]] && echo "✓ Paystack configured" || echo "○ Paystack not set (dev escrow mode)"
[[ -n "${SENTRY_DSN:-}" ]] && echo "✓ Sentry configured" || echo "○ Sentry not set"
[[ -n "${SENDGRID_API_KEY:-}" ]] && echo "✓ SendGrid configured" || echo "○ SendGrid not set"
[[ -n "${TERMII_API_KEY:-}" ]] && echo "✓ Termii configured" || echo "○ Termii not set"

echo ""
echo "Webhook endpoint: $API_URL/webhooks/paystack"
echo "Configure this URL in Paystack dashboard before going live."
echo ""
echo "=== All critical checks passed. Ready for production cutover. ==="
