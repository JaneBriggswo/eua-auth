# 🚀 GUIA RÁPIDO DE INÍCIO

## Começar em 3 Minutos

### 1️⃣ Instalar (Execute no terminal dentro da pasta PhantomAuth)

```bash
npm install
npm run init-db
npm start
```

### 2️⃣ Acessar

Abra no navegador: **http://localhost:3000**

Login:
- **Username**: admin
- **Password**: admin123

### 3️⃣ Criar Seu Primeiro Usuário

1. No painel, clique em "Usuários" → "Novo Usuário"
2. Digite o Discord ID (exemplo: 123456789012345678)
3. Escolha um produto
4. Clique em "Salvar"
5. **IMPORTANTE**: Copie a License Key gerada!

### 4️⃣ Testar no Seu Executável C++

1. Abra `LoaderBaseDX11/includes/auth/auth_example.cpp`
2. Mude o DISCORD_ID para o que você criou
3. Compile e execute seu loader
4. Deve autenticar com sucesso!

---

## 📋 Checklist Antes de Hospedar

- [ ] Mudar `JWT_SECRET` no `.env`
- [ ] Mudar `ADMIN_PASSWORD` no `.env`
- [ ] Mudar `HWID_SALT` no `.env`
- [ ] Escolher plataforma de hospedagem
- [ ] Configurar domínio (opcional)
- [ ] Configurar SSL/HTTPS
- [ ] Testar todos os endpoints
- [ ] Fazer backup do banco de dados

---

## 🌐 Hospedar Online - Método Mais Fácil (Railway)

1. **Criar conta**: https://railway.app (login com GitHub)

2. **Criar novo projeto**:
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Autorize Railway a acessar seu repositório

3. **Configurar Variáveis**:
   - Vá em "Variables"
   - Adicione:
     ```
     JWT_SECRET=SuaChaveSuperSecreta123456789
     ADMIN_PASSWORD=SuaSenhaForte123
     NODE_ENV=production
     PORT=3000
     ```

4. **Deploy**:
   - Railway fará deploy automaticamente
   - Você receberá uma URL tipo: `https://phantom-auth.up.railway.app`

5. **Use no seu C++**:
   ```cpp
   PhantomAuth auth("https://phantom-auth.up.railway.app/api", "DISCORD_ID");
   ```

**PRONTO!** Seu sistema está online!

---

## 💳 Sistema de Pagamento (Integração Futura)

Para vender licenças automaticamente, você pode integrar:

### Opções:
1. **Mercado Pago** (Brasil)
2. **PayPal**
3. **Stripe**
4. **PIX (manual ou automático)**

### Como funciona:
1. Cliente compra no site
2. Após pagamento confirmado, webhook chama sua API
3. API cria usuário automaticamente
4. Cliente recebe License Key por email/Discord

---

## 🎮 Discord Bot (Opcional)

Crie um bot Discord para gerenciar licenças:

```javascript
// Bot commands:
!license create @usuario produto
!license check @usuario
!license extend @usuario 30
!license ban @usuario motivo
```

---

## 📊 Estatísticas e Analytics

Adicione Google Analytics ou Umami para rastrear:
- Quantos usuários logam por dia
- Quais produtos são mais populares
- Taxa de renovação
- Tentativas de acesso inválido

---

## 🔐 Segurança Extra

### Proteção contra Crackers:

1. **Ofuscar seu executável** (VMProtect, Themida)
2. **Anti-debug** (já tem no seu projeto)
3. **Verificações aleatórias** (revalidar a cada X minutos)
4. **String encryption** (não deixe URLs em plain text)
5. **Certificate pinning** (verificar certificado SSL)

### Exemplo de verificação contínua:

```cpp
void ContinuousAuthCheck() {
    while (true) {
        Sleep(300000); // 5 minutos
        
        auto result = auth.Verify();
        if (!result.success) {
            // Licença inválida - encerrar
            ExitProcess(0);
        }
    }
}
```

---

## 📱 Notificações Discord Webhook

Receba notificações quando:
- Novo usuário é criado
- Alguém tenta acessar com HWID diferente
- Licença expira
- Muitas tentativas de login falhas

```javascript
// Adicione no seu server.js
const webhook = "URL_DO_SEU_WEBHOOK_DISCORD";

function sendDiscordNotification(message) {
    axios.post(webhook, {
        content: message,
        username: "Phantom Auth Bot"
    });
}
```

---

## 🎯 Próximos Passos

1. ✅ Sistema funciona localmente
2. ⬜ Hospedar online
3. ⬜ Configurar domínio próprio
4. ⬜ Criar página de vendas
5. ⬜ Integrar pagamento
6. ⬜ Criar Discord bot (opcional)
7. ⬜ Marketing e vendas!

---

## 🆘 Precisa de Ajuda?

### Erros Comuns:

**"npm: command not found"**
→ Instale Node.js: https://nodejs.org

**"Port 3000 already in use"**
→ Mude PORT no .env para 3001

**"Cannot connect to server"**
→ Verifique se o servidor está rodando (npm start)

**"Invalid token"**
→ Faça login novamente no painel

**"HWID mismatch"**
→ Normal, HWID foi vinculado a outro PC. Admin pode resetar no painel.

---

## 💰 Monetização

### Preços Sugeridos:
- 1 Mês: R$ 29,90
- 3 Meses: R$ 69,90 (economize 22%)
- 6 Meses: R$ 119,90 (economize 33%)
- Lifetime: R$ 199,90

### Estratégias:
- Ofereça trial de 24h grátis
- Sistema de referral (indique e ganhe)
- Descontos em datas especiais
- VIP membership com vantagens

---

**🎉 Seu sistema está pronto para uso profissional!**

Boa sorte com suas vendas! 👻💜
