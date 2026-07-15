# Plano de Backup — PHD Escola Virtual

## 1. Objetivo

Este documento define o processo de backup da plataforma PHD Escola Virtual.

## 2. Itens que precisam de backup

- Banco de dados Supabase
- Tabelas públicas:
  - users
  - activities
  - activity_attachments
  - activity_responses
  - notifications
  - messages
  - english_modules
- Storage:
  - bucket activity-files
- Código-fonte:
  - GitHub: sistemaphdescolavirtual/Siteingles-phd
- Variáveis de ambiente:
  - Vercel backend
  - Vercel frontend
  - Supabase

## 3. Frequência recomendada

### Banco de dados

- Backup manual antes de alterações grandes.
- Backup semanal durante uso normal.
- Backup diário caso a plataforma esteja com alunos ativos.

### Storage

- Revisar arquivos enviados semanalmente.
- Manter bucket activity-files privado.

### Código

- Todo ajuste deve ser salvo com:
  - git status
  - git add
  - git commit
  - git push

## 4. Backup manual do banco Supabase

No Supabase:

1. Acessar o projeto.
2. Ir em SQL Editor.
3. Exportar ou copiar dados críticos antes de mudanças grandes.
4. Conferir se as tabelas principais estão acessíveis.
5. Nunca compartilhar SERVICE_ROLE_KEY.

## 5. Backup do código

Comandos:

```powershell
cd D:\Siteingles-phd

git status

git add .

git commit -m "backup: salvar estado atual do projeto"

git push