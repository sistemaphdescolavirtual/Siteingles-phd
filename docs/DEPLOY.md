# Deploy — PHD Escola Virtual

## 1. Repositório

GitHub:

sistemaphdescolavirtual/Siteingles-phd

Branch principal:

main

## 2. Backend

URL:

https://siteingles-backend.vercel.app

Variáveis necessárias:

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_PUBLISHABLE_KEY
- FRONTEND_URL
- FRONTEND_URLS

Rotas principais:

- /api/health
- /api/auth/login
- /api/auth/register
- /api/professor
- /api/activities
- /api/chat
- /api/notifications
- /api/admin

Teste de saúde:

```powershell
Invoke-RestMethod `
  -Uri "https://siteingles-backend.vercel.app/api/health" `
  | ConvertTo-Json -Depth 5