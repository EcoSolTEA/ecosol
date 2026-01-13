🌿 Ecosol - Plataforma de Economia Solidária

A Ecosol é uma plataforma robusta desenvolvida para a gestão e fomento da economia solidária. O foco do projeto é conectar prestadores de serviços e consumidores dentro de um ecossistema sustentável, utilizando uma interface otimizada para alta densidade de informação e performance.
🚀 Tecnologias e Arquitetura

O projeto utiliza o que há de mais moderno no ecossistema JavaScript para garantir escalabilidade e tipagem segura:

    Framework: Next.js 16 (Turbopack) - App Router para máxima performance.

    ORM: Prisma 7.2 - Gerenciamento de banco de dados com prisma.config.ts.

    Database: Supabase (PostgreSQL) - Infraestrutura na nuvem com Connection Pooling.

    E-mail: Resend - Infraestrutura de entrega de e-mails via API.

    Styling: Tailwind CSS - Design System baseado em "pílulas" (arredondamento de 2.5rem).

🛠 Configuração Técnica (Engenharia de Dados)

Diferente de versões anteriores, este projeto utiliza o Prisma 7.2, onde a configuração de conexão foi movida para um arquivo TypeScript dedicado, garantindo maior flexibilidade entre ambientes.
1. Variáveis de Ambiente (.env)

Configure as URLs de conexão diferenciando o tráfego de transação do tráfego de migração:
Bash

# Porta 6543 - Transaction Mode (Uso da Aplicação via PgBouncer)
DATABASE_URL="postgresql://postgres.[ID]:[SENHA]@[HOST]:6543/postgres?pgbouncer=true"

# Porta 5432 - Session Mode (Uso exclusivo para Migrations/CLI)
DIRECT_URL="postgresql://postgres.[ID]:[SENHA]@[HOST]:5432/postgres"

# Infraestrutura Adicional
NEXT_PUBLIC_SUPABASE_URL="https://[ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_chave_anon_aqui"
RESEND_API_KEY="re_sua_chave_aqui"

2. Configuração do Prisma CLI (prisma.config.ts)

Para garantir que as migrações ocorram sem erros de pooler, o arquivo de configuração aponta para a conexão direta:
TypeScript

import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  datasource: {
    // CLI utiliza a DIRECT_URL na porta 5432
    url: process.env.DIRECT_URL as string,
  },
});

📦 Diferenciais do Projeto

    Design System Otimizado: Interface compacta (Header h-14) focada em exibir o máximo de conteúdo útil com clareza visual.

    Hierarquia de Dados: Cards padronizados com arredondamento de 2.5rem e ícones Lucide para facilitar a logística de contato (WhatsApp/Redes Sociais).

    Segurança: Autenticação via Supabase com rotas de consentimento customizadas e proteção de rotas administrativas.

    Infraestrutura de E-mail: Integração com Resend para garantir que submissões de formulários cheguem ao destino sem falhas.

⚙️ Como Executar o Projeto

    Instale as dependências:
    Bash

npm install

Sincronize o Banco de Dados:
Bash

npx prisma generate
npx prisma db push

Inicie o ambiente de desenvolvimento:
Bash

npm run dev

🔐 Autenticação e Storage (Supabase Dashboard)

Configurações necessárias no painel do Supabase para o funcionamento correto da plataforma:

    Redirect URLs: Adicione http://localhost:3000/** em Authentication > URL Configuration.

    Rota de Consentimento: Implementada em app/oauth/consent/page.tsx para gerenciar autorizações de login.

    Storage: Criar bucket público chamado logos.

Learn More

To learn more about Next.js, take a look at the following resources:

    Next.js Documentation - learn about Next.js features and API.

    Learn Next.js - an interactive Next.js tutorial.

You can check out the Next.js GitHub repository - your feedback and contributions are welcome!
Deploy on Vercel

The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js.

Check out our Next.js deployment documentation for more details.
