# 👻 Phantom Auth System - Sistema de Autenticação Completo

Sistema de autenticação completo para seu executável PhantomBypass com:
- ✅ Painel admin web moderno
- ✅ API REST completa
- ✅ Autenticação via Discord User ID
- ✅ Gerenciamento de usuários, produtos e licenças
- ✅ Sistema de HWID
- ✅ Logs detalhados
- ✅ Sistema de ban/unban
- ✅ Integração C++ pronta

## 📁 Estrutura do Projeto

```
PhantomAuth/
├── server.js                 # Servidor principal
├── package.json             # Dependências
├── .env                     # Configurações
├── database/
│   ├── database.js         # Configuração do banco
│   └── phantom.db          # Banco SQLite (criado automaticamente)
├── models/                  # Models do banco de dados
│   ├── Admin.js
│   ├── User.js
│   ├── Product.js
│   └── Log.js
├── routes/                  # Rotas da API
│   ├── auth.js
│   ├── users.js
│   ├── products.js
│   ├── client.js
│   └── logs.js
├── middleware/
│   └── auth.js             # Middleware de autenticação
├── scripts/
│   └── initDatabase.js     # Inicializar banco de dados
└── public/                  # Frontend (painel admin)
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

## 🚀 Instalação Local

### Requisitos
- Node.js 16+ instalado
- Windows/Linux/Mac

### Passo 1: Instalar Dependências

Abra o terminal na pasta `PhantomAuth` e execute:

```bash
npm install
```

### Passo 2: Configurar Variáveis de Ambiente

O arquivo `.env` já está configurado com valores padrão. MUDE as seguintes variáveis em produção:

```env
JWT_SECRET=sua_chave_super_secreta_aqui_mude_isso_123456789
ADMIN_PASSWORD=admin123
HWID_SALT=seu_salt_aleatorio_aqui
```

### Passo 3: Inicializar Banco de Dados

```bash
npm run init-db
```

Isso criará:
- Admin padrão (username: `admin`, senha: `admin123`)
- 3 produtos de exemplo
- 1 usuário de teste

### Passo 4: Iniciar Servidor

```bash
npm start
```

O servidor estará rodando em: `http://localhost:3000`

Painel Admin: `http://localhost:3000`

## 🌐 Hospedagem Online

### Opção 1: Heroku (Grátis/Fácil)

1. Crie uma conta em https://heroku.com
2. Instale o Heroku CLI
3. Na pasta PhantomAuth, execute:

```bash
heroku login
heroku create phantom-auth-system
git init
git add .
git commit -m "Initial commit"
git push heroku master
```

4. Configure as variáveis de ambiente:

```bash
heroku config:set JWT_SECRET=sua_chave_secreta
heroku config:set ADMIN_PASSWORD=sua_senha_forte
heroku config:set NODE_ENV=production
```

Seu sistema estará em: `https://phantom-auth-system.herokuapp.com`

### Opção 2: Railway (Recomendado - Grátis)

1. Acesse https://railway.app
2. Conecte seu GitHub
3. Clique em "New Project" -> "Deploy from GitHub repo"
4. Selecione o repositório
5. Railway detectará automaticamente Node.js
6. Configure as variáveis de ambiente no painel

### Opção 3: VPS (Controle Total)

#### Usando VPS Linux (Ubuntu/Debian)

1. Conecte via SSH ao seu VPS:

```bash
ssh root@seu-ip-vps
```

2. Instale Node.js:

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
```

3. Instale PM2 (gerenciador de processos):

```bash
npm install -g pm2
```

4. Clone/Envie seus arquivos para o VPS

5. Na pasta do projeto:

```bash
npm install
npm run init-db
pm2 start server.js --name phantom-auth
pm2 save
pm2 startup
```

6. Configure Nginx como proxy reverso:

```bash
apt install nginx

# Crie arquivo de configuração
nano /etc/nginx/sites-available/phantom-auth
```

Cole:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/phantom-auth /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

7. (Opcional) Configure SSL com Let's Encrypt:

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d seu-dominio.com
```

### Opção 4: Vercel (Frontend) + Railway (Backend)

1. Frontend no Vercel (grátis)
2. Backend no Railway (grátis)
3. Configure CORS no backend para aceitar requisições do frontend

## 📱 Acessando o Painel Admin

1. Acesse `http://seu-dominio.com` (ou localhost:3000)
2. Login padrão:
   - Username: `admin`
   - Password: `admin123`
3. **IMPORTANTE**: Mude a senha após primeiro login!

## 🎮 Integração com C++

### Requisitos
- nlohmann/json library (adicione ao seu projeto)
- WinInet.lib

### Uso Básico

```cpp
#include "includes/auth/phantom_auth.hpp"

// URL do seu servidor hospedado
PhantomAuth auth("https://seu-dominio.com/api", "DISCORD_ID_DO_USUARIO");

auto result = auth.Verify();
if (result.success) {
    // Usuário autenticado!
    std::cout << "Bem-vindo: " << result.username << std::endl;
} else {
    // Acesso negado
    std::cout << "Erro: " << result.message << std::endl;
    exit(1);
}
```

## 🔧 Endpoints da API

### Para o Cliente C++ (Público)

- `POST /api/client/verify` - Verificar por Discord ID
- `POST /api/client/verify-key` - Verificar por License Key
- `GET /api/client/status` - Status do servidor

### Para o Painel Admin (Autenticado)

- `POST /api/auth/login` - Login de admin
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário
- `POST /api/users/:id/ban` - Banir usuário
- `POST /api/users/:id/unban` - Desbanir usuário
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `GET /api/logs` - Ver logs

## 🔐 Segurança

### Já Implementado:
- ✅ JWT para autenticação de admins
- ✅ Bcrypt para hash de senhas
- ✅ Rate limiting (proteção contra spam)
- ✅ HWID binding (um PC por licença)
- ✅ Helmet.js (headers de segurança)
- ✅ Logs de todas as ações
- ✅ Sistema de tentativas de login falhas

### Recomendações Adicionais:
- Use HTTPS em produção (SSL/TLS)
- Mude JWT_SECRET para algo aleatório e forte
- Configure firewall no VPS
- Faça backup regular do banco de dados
- Use variáveis de ambiente para dados sensíveis

## 📊 Funcionalidades do Painel

### Dashboard
- Estatísticas em tempo real
- Total de usuários, ativos, banidos, expirados

### Gerenciar Usuários
- ✅ Criar usuários com Discord ID
- ✅ Editar informações
- ✅ Banir/Desbanir com motivo
- ✅ Deletar usuários
- ✅ Ver status de licença
- ✅ Ver HWID vinculado

### Gerenciar Produtos
- ✅ Criar produtos com preço e duração
- ✅ Editar produtos
- ✅ Ativar/Desativar produtos
- ✅ Deletar produtos

### Logs
- ✅ Ver todas as ações do sistema
- ✅ Filtrar por usuário
- ✅ Ver tentativas de login
- ✅ Rastrear IPs

## 🆘 Solução de Problemas

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "Port 3000 already in use"
Mude a porta no `.env`:
```env
PORT=3001
```

### Banco de dados corrompido
Delete `database/phantom.db` e execute:
```bash
npm run init-db
```

### Esquecer senha de admin
Reinicialize o banco ou crie novo admin via código

## 📝 Workflow Recomendado

1. **Desenvolvimento Local**: Teste tudo no localhost
2. **Deploy para Servidor**: Hospede em Railway/Heroku/VPS
3. **Configure Domínio**: Aponte seu domínio para o servidor
4. **SSL**: Configure HTTPS
5. **Integre no C++**: Mude API_URL para seu domínio
6. **Distribua**: Compile e distribua seu executável

## 💡 Dicas

- Use Discord OAuth2 para login automático (implementação futura)
- Adicione webhooks do Discord para notificações
- Implemente sistema de pagamento (Stripe/PayPal)
- Adicione expiração automática de licenças
- Configure backup automático do banco

## 📞 Suporte

Sistema totalmente funcional e pronto para uso. 

Arquivo criado em: `PhantomAuth/`

**IMPORTANTE**: 
- Mude as senhas e chaves secretas antes de colocar em produção!
- Use HTTPS em produção!
- Faça backups regulares do banco de dados!

---

**Status**: ✅ Sistema completo e funcional
**Versão**: 1.0.0
**Criado para**: PhantomBypass
