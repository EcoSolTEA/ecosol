# 🌿 Ecosol - Plataforma de Economia Solidária

Plataforma voltada para a gestão e fomento da economia solidária, desenvolvida com **Next.js 15**, **Prisma 7.2** e **Supabase**.

## 🚀 Começando

### Pré-requisitos
- Node.js 18+ e npm/yarn/pnpm/bun
- Conta no Supabase
- Git

### Instalação
1. Clone o repositório: `git clone https://github.com/seu-usuario/ecosol.git`
2. Acesse a pasta: `cd ecosol`
3. Instale as dependências: `npm install`
4. Configure as variáveis de ambiente: `cp .env.example .env.local`
5. Preencha o arquivo `.env.local` com suas credenciais

## ⚙️ Configuração do Ambiente
**Variáveis de Ambiente (.env.local):**

DATABASE_URL="postgresql://postgres.[ID]:[SENHA]@[HOST]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ID]:[SENHA]@[HOST]:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_chave_anon_aqui"
SUPABASE_SERVICE_ROLE_KEY="sua_chave_de_servico_aqui"
text

**Importante:** Codifique caracteres especiais na senha (ex: * → %2A)

**Configuração do Prisma 7.2:**
Crie o arquivo `prisma.config.ts` na raiz:

import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
dotenv.config();
export default defineConfig({
datasource: {
url: process.env.DIRECT_URL as string,
},
});
text


**Configuração do Banco de Dados:**

npx prisma generate
npx prisma migrate dev --name init
npx prisma studio
text


## 🔐 Configuração do Supabase
1. **Authentication:** No Dashboard do Supabase, vá em Authentication > URL Configuration e adicione:
   - `http://localhost:3000/**`
   - `https://seu-dominio.com/**` (para produção)
2. **Storage:** Crie um bucket público chamado `logos` e configure as permissões.

## 🏃 Executando o Projeto
**Ambiente de Desenvolvimento:** `npm run dev` e acesse http://localhost:3000
**Build para Produção:** `npm run build` e depois `npm start`

## 📁 Estrutura do Projeto

ecosol/
├── app/ # Diretório principal da aplicação Next.js
│ ├── api/ # Rotas da API
│ ├── auth/ # Páginas de autenticação
│ ├── oauth/ # Fluxo OAuth (inclui consent)
│ └── page.tsx # Página inicial
├── components/ # Componentes React reutilizáveis
├── lib/ # Utilities e configurações
│ ├── prisma.ts # Cliente Prisma
│ └── supabase.ts # Cliente Supabase
├── prisma/ # Schema do Prisma
│ └── schema.prisma # Definição do modelo de dados
├── public/ # Arquivos estáticos
└── styles/ # Estilos globais
text


## 🛠 Tecnologias Utilizadas
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Prisma 7.2** - ORM para banco de dados
- **Supabase** - Backend como serviço
- **Tailwind CSS** - Estilização
- **React Hook Form** - Manipulação de formulários
- **Zod** - Validação de schemas

## 🔧 Scripts Disponíveis
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm start` - Inicia servidor de produção
- `npm run lint` - Executa linter
- `npx prisma generate` - Gera cliente Prisma
- `npx prisma migrate dev` - Executa migrações
- `npx prisma studio` - Abre interface do Prisma

## 🤝 Contribuindo
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença
Este projeto está sob licença MIT.

## 📚 Links Úteis
- [Documentação Next.js](https://nextjs.org/docs)
- [Tutorial Next.js](https://nextjs.org/learn)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)

## 🚀 Deploy na Vercel
1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente na dashboard da Vercel
3. O deploy será automático a cada push

**Nota:** Este projeto utiliza `next/font` para otimizar e carregar automaticamente a fonte Geist.

---

Desenvolvido com ❤️ para a economia solidária.
