# 🎮 Integração com Discord - Guia Completo

Este guia mostra como integrar o Discord para obter automaticamente o Discord ID do usuário.

## Método 1: Discord OAuth2 (Recomendado)

### Passo 1: Criar Aplicação Discord

1. Acesse https://discord.com/developers/applications
2. Clique em "New Application"
3. Dê um nome (ex: "Phantom Auth")
4. Vá em "OAuth2" → "General"
5. Copie:
   - **Client ID**
   - **Client Secret**
6. Adicione Redirect URL: `http://localhost:3000/auth/discord/callback`

### Passo 2: Configurar no Backend

Adicione no `.env`:
```env
DISCORD_CLIENT_ID=seu_client_id_aqui
DISCORD_CLIENT_SECRET=seu_client_secret_aqui
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
```

### Passo 3: Adicionar Rota Discord OAuth

Crie `routes/discord.js`:

```javascript
const express = require('express');
const router = express.Router();
const axios = require('axios');

const DISCORD_API = 'https://discord.com/api/v10';
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

// Redirecionar para Discord OAuth
router.get('/login', (req, res) => {
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
    res.redirect(authUrl);
});

// Callback do Discord
router.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('Código não fornecido');
    }

    try {
        // Trocar code por access token
        const tokenResponse = await axios.post(
            `${DISCORD_API}/oauth2/token`,
            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token } = tokenResponse.data;

        // Buscar informações do usuário
        const userResponse = await axios.get(`${DISCORD_API}/users/@me`, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        const discordUser = userResponse.data;

        // Retornar informações para o frontend
        res.send(`
            <html>
                <head>
                    <title>Discord Login Success</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background: #1e1e2e;
                            color: #fff;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                        }
                        .container {
                            text-align: center;
                            background: #2a2a3e;
                            padding: 40px;
                            border-radius: 15px;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                        }
                        .success {
                            color: #10b981;
                            font-size: 48px;
                            margin-bottom: 20px;
                        }
                        .info {
                            background: #363650;
                            padding: 15px;
                            border-radius: 8px;
                            margin: 10px 0;
                        }
                        .discord-id {
                            font-size: 24px;
                            font-weight: bold;
                            color: #6366f1;
                            margin: 20px 0;
                            padding: 15px;
                            background: #404060;
                            border-radius: 8px;
                        }
                        button {
                            background: #6366f1;
                            color: white;
                            border: none;
                            padding: 12px 30px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 16px;
                            margin-top: 20px;
                        }
                        button:hover {
                            background: #4f46e5;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="success">✅</div>
                        <h1>Login com Discord Realizado!</h1>
                        <div class="info">
                            <p><strong>Username:</strong> ${discordUser.username}#${discordUser.discriminator}</p>
                            <p><strong>Email:</strong> ${discordUser.email || 'N/A'}</p>
                        </div>
                        <div class="discord-id">
                            <strong>Discord ID:</strong><br>
                            ${discordUser.id}
                        </div>
                        <p>Use este Discord ID no executável</p>
                        <button onclick="window.close()">Fechar</button>
                        <script>
                            // Salvar no localStorage para uso posterior
                            localStorage.setItem('discord_id', '${discordUser.id}');
                            localStorage.setItem('discord_username', '${discordUser.username}#${discordUser.discriminator}');
                        </script>
                    </div>
                </body>
            </html>
        `);

    } catch (error) {
        console.error('Erro no Discord OAuth:', error);
        res.status(500).send('Erro ao autenticar com Discord');
    }
});

module.exports = router;
```

Adicione no `server.js`:
```javascript
const discordRoutes = require('./routes/discord');
app.use('/auth/discord', discordRoutes);
```

### Passo 4: Usar no Frontend

Adicione botão de login Discord:
```html
<a href="/auth/discord/login">
    <button class="btn btn-discord">
        <i class="fab fa-discord"></i> Login com Discord
    </button>
</a>
```

---

## Método 2: Discord Bot (Automático)

### Criar Bot para Verificação Automática

```javascript
// discord-bot.js
const { Client, IntentsBitField } = require('discord.js');
const UserModel = require('./models/User');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers
    ]
});

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID; // ID do seu servidor Discord

client.on('ready', () => {
    console.log(`✅ Bot Discord conectado como ${client.user.tag}`);
});

// Comando: !license
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    // Comando para verificar licença
    if (message.content === '!license') {
        const discordId = message.author.id;
        const user = UserModel.findByDiscordId(discordId);

        if (!user) {
            message.reply('❌ Você não possui uma licença ativa.');
            return;
        }

        if (user.is_banned) {
            message.reply(`🚫 Você está banido. Motivo: ${user.ban_reason}`);
            return;
        }

        const expiresAt = new Date(user.expires_at);
        const now = new Date();
        const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

        if (daysRemaining <= 0) {
            message.reply('⏰ Sua licença expirou!');
            return;
        }

        message.reply({
            embeds: [{
                color: 0x6366f1,
                title: '✅ Licença Ativa',
                fields: [
                    { name: 'Produto', value: user.product_name || 'N/A', inline: true },
                    { name: 'Dias Restantes', value: daysRemaining.toString(), inline: true },
                    { name: 'Expira em', value: expiresAt.toLocaleDateString('pt-BR'), inline: false },
                    { name: 'License Key', value: `||${user.license_key}||`, inline: false }
                ],
                timestamp: new Date()
            }]
        });
    }
});

client.login(BOT_TOKEN);
```

Iniciar bot:
```bash
node discord-bot.js
```

---

## Método 3: Integração no C++ com Discord RPC

### Usando Discord Rich Presence para pegar ID

```cpp
#include <discord_rpc.h>

void InitDiscord() {
    DiscordEventHandlers handlers;
    memset(&handlers, 0, sizeof(handlers));
    
    handlers.ready = [](const DiscordUser* user) {
        std::string discordId = user->userId;
        std::cout << "Discord ID: " << discordId << std::endl;
        
        // Usar este ID para autenticação
        PhantomAuth auth("https://seu-dominio.com/api", discordId);
        auto result = auth.Verify();
        
        if (!result.success) {
            MessageBoxA(NULL, result.message.c_str(), "Erro", MB_ICONERROR);
            exit(1);
        }
    };
    
    Discord_Initialize("YOUR_DISCORD_APP_ID", &handlers, 1, NULL);
}
```

---

## Método 4: WebView no C++ (Mais Fácil)

### Abrir navegador para login Discord

```cpp
#include <windows.h>

std::string GetDiscordIdViaWeb() {
    // Abrir navegador para login Discord
    ShellExecuteA(NULL, "open", 
        "http://localhost:3000/auth/discord/login", 
        NULL, NULL, SW_SHOWNORMAL);
    
    // Aguardar usuário fazer login (simplificado)
    MessageBoxA(NULL, 
        "Faça login com Discord no navegador e copie seu Discord ID",
        "Autenticação", MB_OK);
    
    // Pedir Discord ID (ou implementar socket server para receber automaticamente)
    // ...
}
```

---

## Como os Usuários Obtêm Discord ID Manualmente

### Instruções para Usuários:

1. Abra Discord
2. Vá em **Configurações** → **Avançado**
3. Ative **Modo Desenvolvedor**
4. Clique com botão direito no seu nome
5. Clique em **Copiar ID**
6. Cole no executável quando solicitado

---

## Integração Completa Recomendada

### Fluxo Ideal:

1. **Usuário compra licença** → Recebe email com instruções
2. **Abre o executável** → Clica em "Login com Discord"
3. **Navegador abre** → Login Discord OAuth
4. **Discord ID salvo automaticamente** → Volta ao executável
5. **Autenticação automática** → Pronto para usar!

---

## Webhook Discord (Notificações)

### Receber notificações no Discord:

```javascript
const axios = require('axios');

async function sendWebhook(webhookUrl, message) {
    await axios.post(webhookUrl, {
        embeds: [{
            title: message.title,
            description: message.description,
            color: message.color,
            timestamp: new Date()
        }]
    });
}

// Exemplo de uso:
// Quando novo usuário é criado
sendWebhook(process.env.DISCORD_WEBHOOK_URL, {
    title: '🎉 Novo Cliente!',
    description: `Discord ID: ${user.discord_id}\nProduto: ${product.name}`,
    color: 0x10b981
});

// Quando tentativa de HWID inválido
sendWebhook(process.env.DISCORD_WEBHOOK_URL, {
    title: '⚠️ Tentativa de HWID Inválido',
    description: `Discord ID: ${user.discord_id}\nHWID: ${hwid}`,
    color: 0xef4444
});
```

---

## Configurar Webhook:

1. No seu servidor Discord
2. Configurações do Canal → Integrações → Webhooks
3. Criar webhook → Copiar URL
4. Adicionar no `.env`:
```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

---

**🎯 Pronto! Integração Discord completa implementada!**
