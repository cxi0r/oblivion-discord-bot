const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// ============================================================
//  1. BOT DE DISCORD
// ============================================================
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const commands = [
    new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Genera un script de OBLIVION')
        .addStringOption(option => 
            option.setName('username')
                .setDescription('Tu Roblox username')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('webhook')
                .setDescription('Tu Discord webhook')
                .setRequired(false)),
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra la ayuda de OBLIVION-HUB')
];

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

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'help') {
        await interaction.reply({ 
            content: '🤖 **Comandos disponibles:**\n`/generate` - Genera un script\n`/help` - Muestra esta ayuda',
            ephemeral: true 
        });
        return;
    }

    if (interaction.commandName === 'generate') {
        await interaction.deferReply();
        const username = interaction.options.getString('username');
        const webhook = interaction.options.getString('webhook') || 'No especificado';
        
        // Aquí conectaremos con tu API de Vercel más adelante
        await interaction.editReply(`🚀 Generando script para **${username}** con webhook:\n\`${webhook}\`\n*(Pronto se conectará con la API de generación)*`);
    }
});

client.login(TOKEN);

// ============================================================
//  2. SERVIDOR HTTP PARA RENDER (PUERTO 10000)
// ============================================================
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('🤖 Bot de OBLIVION-HUB funcionando correctamente.');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Servidor HTTP escuchando en el puerto ${port}`);
});
