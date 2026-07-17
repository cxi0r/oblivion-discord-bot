const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// ============================================================
//  CONFIGURACIÓN DE ENTORNO
// ============================================================
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const API_URL = process.env.API_URL || 'https://oblivionhub.xyz';
const ALLOWED_CHANNEL_ID = process.env.ALLOWED_CHANNEL_ID || '1527591255029321759';
const WEBHOOK_CATEGORY_ID = '1527769313040269322';
const MAX_WEBHOOKS = 350;
const BOT_OWNER_ID = '1427070113017761833';

// ============================================================
//  PERSISTENCIA EN ARCHIVO JSON
// ============================================================
const DATA_FILE = path.join(__dirname, 'webhooks.json');

function loadWebhooks() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading webhooks:', error);
    }
    return {};
}

function saveWebhooks(webhooks) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(webhooks, null, 2));
    } catch (error) {
        console.error('Error saving webhooks:', error);
    }
}

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
//  FILTRO DE MENSAJES EN EL CANAL #COMMANDS
// ============================================================
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channelId !== ALLOWED_CHANNEL_ID) return;
    if (message.content.startsWith('/')) return;
    if (message.interaction) return;

    try {
        await message.delete();
        const reply = await message.channel.send({
            content: `❌ <@${message.author.id}>, only slash commands (/) are allowed in this channel. Use \`/generate\`, \`/help\`, etc.`,
            ephemeral: true
        });
        setTimeout(async () => {
            try {
                await reply.delete();
            } catch (e) {}
        }, 5000);
    } catch (error) {
        console.error('Error al borrar mensaje:', error);
    }
});

// ============================================================
//  DEFINICIÓN DE COMANDOS SLASH
// ============================================================
const commands = [
    new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Generate an OBLIVION script with your selections')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Your Roblox username')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('webhook')
                .setDescription('Your Discord webhook (optional)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Execution mode')
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
                .setDescription('Brainrot preset')
                .setRequired(false)
                .addChoices(
                    { name: 'Secret', value: 'secret' },
                    { name: 'OG', value: 'og' },
                    { name: 'ALL (Secret + OG)', value: 'all' }
                ))
        .addStringOption(option =>
            option.setName('skins')
                .setDescription('Skins to include')
                .setRequired(false)
                .addChoices(
                    { name: 'ALL', value: 'all' }
                ))
        .addStringOption(option =>
            option.setName('gears')
                .setDescription('Gears to include')
                .setRequired(false)
                .addChoices(
                    { name: 'ALL', value: 'all' }
                ))
        .addStringOption(option =>
            option.setName('custom_code')
                .setDescription('Custom code (only for Custom mode)')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('obfuscate')
                .setDescription('Obfuscate the script? (if fails, uploaded without obfuscation)')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show OBLIVION-HUB help'),

    new SlashCommandBuilder()
        .setName('webhook')
        .setDescription('Create a personal webhook channel')
        .addSubcommand(sub => 
            sub.setName('create')
                .setDescription('Create a personal webhook channel for you')),

    new SlashCommandBuilder()
        .setName('paste')
        .setDescription('Create a text paste on OBLIVION-HUB')
        .addStringOption(option =>
            option.setName('content')
                .setDescription('The content of the paste')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Paste title (optional)')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('public')
                .setDescription('Public or only visible to you?')
                .setRequired(false))
];

// ============================================================
//  REGISTRO DE COMANDOS
// ============================================================
const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    console.log(`✅ Bot connected as ${client.user.tag}`);
    try {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands.map(cmd => cmd.toJSON())
        });
        console.log('✅ Commands registered successfully.');
    } catch (error) {
        console.error('❌ Error registering commands:', error);
    }
});

// ============================================================
//  FUNCIÓN AUXILIAR PARA CREAR WEBHOOK (CON BOTÓN "COPY")
// ============================================================
async function createNewWebhook(guild, user, category, interaction) {
    // Obtener el siguiente número disponible
    const existingChannels = category.children.cache
        .filter(ch => ch.type === ChannelType.GuildText && ch.name.startsWith('webhook-'))
        .sort((a, b) => {
            const numA = parseInt(a.name.split('-')[1]) || 0;
            const numB = parseInt(b.name.split('-')[1]) || 0;
            return numA - numB;
        });

    let nextNumber = 1;
    for (const channel of existingChannels.values()) {
        const num = parseInt(channel.name.split('-')[1]) || 0;
        if (num >= nextNumber) {
            nextNumber = num + 1;
        }
    }

    if (nextNumber > MAX_WEBHOOKS) {
        await interaction.editReply({
            content: `❌ Maximum number of webhook channels (${MAX_WEBHOOKS}) reached.`,
            ephemeral: true
        });
        return;
    }

    const channelName = `webhook-${nextNumber}`;

    // Obtener usuarios en caché
    const ownerUser = await guild.members.fetch(BOT_OWNER_ID).catch(() => null);
    const botMember = guild.members.cache.get(client.user.id);
    const userMember = await guild.members.fetch(user.id).catch(() => null);

    const permissionOverwrites = [
        {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
        }
    ];

    if (userMember) {
        permissionOverwrites.push({
            id: user.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.AttachFiles,
                PermissionsBitField.Flags.EmbedLinks,
            ],
        });
    }

    if (ownerUser) {
        permissionOverwrites.push({
            id: BOT_OWNER_ID,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.ManageChannels,
                PermissionsBitField.Flags.ManageMessages,
            ],
        });
    }

    if (botMember) {
        permissionOverwrites.push({
            id: client.user.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.ManageMessages,
                PermissionsBitField.Flags.ManageWebhooks,
            ],
        });
    }

    const newChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: WEBHOOK_CATEGORY_ID,
        permissionOverwrites: permissionOverwrites,
    });

    const webhook = await newChannel.createWebhook({
        name: `webhook-${user.username}`,
        avatar: user.displayAvatarURL(),
    });

    // Guardar en archivo JSON
    const webhooks = loadWebhooks();
    webhooks[user.id] = {
        channelId: newChannel.id,
        webhookUrl: webhook.url,
        webhookId: webhook.id,
        createdAt: Date.now()
    };
    saveWebhooks(webhooks);

    // Mensaje de éxito con botón para copiar
    const successMessage = 
        `✅ **ENGLISH:** Your webhook channel has been created successfully!\n` +
        `📁 Channel: <#${newChannel.id}>\n` +
        `🔗 Webhook URL: ${webhook.url}\n\n` +
        `📌 **SPANISH:** ¡Tu canal de webhook ha sido creado exitosamente!\n` +
        `📁 Canal: <#${newChannel.id}>\n` +
        `🔗 URL del Webhook: ${webhook.url}\n\n` +
        `⚠️ Only you and the bot owner can see this channel. / Solo tú y el dueño del bot pueden ver este canal.`;

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`copy_webhook_${user.id}`)
                .setLabel('📋 Copy URL')
                .setStyle(ButtonStyle.Primary)
        );

    // Enviar por DM
    try {
        await user.send({
            content: successMessage,
            components: [row]
        });
    } catch (dmError) {}

    // Responder en el canal
    await interaction.editReply({
        content: successMessage,
        components: [row],
        ephemeral: true
    });

    // Mensaje de bienvenida en el canal webhook (bilingüe) con botón
    const welcomeRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`copy_webhook_${user.id}`)
                .setLabel('📋 Copy URL')
                .setStyle(ButtonStyle.Primary)
        );

    await newChannel.send({
        content: 
            `🔔 **${user.username}**, this is your personal webhook channel.\n\n` +
            `📌 **ENGLISH:** Only you and the bot owner can see this channel.\n` +
            `🔗 Your webhook URL: ${webhook.url}\n` +
            `⚠️ Keep this URL private. Anyone with this URL can send messages to this channel.\n\n` +
            `📌 **SPANISH:** Solo tú y el dueño del bot pueden ver este canal.\n` +
            `🔗 Tu URL del webhook: ${webhook.url}\n` +
            `⚠️ Mantén esta URL privada. Cualquiera con esta URL puede enviar mensajes a este canal.`,
        components: [welcomeRow]
    });
}

// ============================================================
//  MANEJADOR DE INTERACCIONES (COMANDOS Y BOTONES)
// ============================================================
client.on('interactionCreate', async interaction => {
    // --- MANEJAR BOTONES ---
    if (interaction.isButton()) {
        const customId = interaction.customId;
        const user = interaction.user;

        if (customId.startsWith('copy_webhook_')) {
            const userId = customId.replace('copy_webhook_', '');
            if (user.id !== userId && user.id !== BOT_OWNER_ID) {
                await interaction.reply({
                    content: '❌ You are not authorized to copy this webhook URL.',
                    ephemeral: true
                });
                return;
            }

            const webhooks = loadWebhooks();
            const webhookData = webhooks[userId];
            if (!webhookData) {
                await interaction.reply({
                    content: '❌ Webhook not found. It may have been deleted.',
                    ephemeral: true
                });
                return;
            }

            const url = webhookData.webhookUrl;
            await interaction.reply({
                content: `📋 **Webhook URL**\n\`\`\`\n${url}\n\`\`\``,
                ephemeral: true
            });
            return;
        }

        // Botones de confirmación (webhook_accept / webhook_cancel) se manejan en el comando
        return;
    }

    // --- MANEJAR COMANDOS SLASH ---
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user, options, channelId } = interaction;

    if (channelId !== ALLOWED_CHANNEL_ID) {
        await interaction.reply({
            content: `❌ Please use this command in the <#${ALLOWED_CHANNEL_ID}> channel.`,
            ephemeral: true
        });
        return;
    }

    // ---- WEBHOOK CREATE ----
    if (commandName === 'webhook') {
        const subcommand = options.getSubcommand();

        if (subcommand === 'create') {
            await interaction.deferReply({ ephemeral: true });

            try {
                const guild = interaction.guild;
                const category = guild.channels.cache.get(WEBHOOK_CATEGORY_ID);

                if (!category) {
                    await interaction.editReply({
                        content: '❌ The webhook category was not found. Please contact an administrator.',
                        ephemeral: true
                    });
                    return;
                }

                // Verificar si el usuario ya tiene un webhook (desde archivo JSON)
                const webhooks = loadWebhooks();
                const existingData = webhooks[user.id];

                if (existingData) {
                    // Mostrar mensaje de confirmación con botones
                    const warningMessage = 
                        `⚠️ **ENGLISH:** You already have a webhook. Do you want to replace it with a new one?\n\n` +
                        `⚠️ **ESPAÑOL:** Ya tienes un webhook. ¿Quieres reemplazarlo por uno nuevo?`;

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('webhook_accept')
                                .setLabel('✅ Accept')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId('webhook_cancel')
                                .setLabel('❌ Cancel')
                                .setStyle(ButtonStyle.Danger)
                        );

                    await interaction.editReply({
                        content: warningMessage,
                        components: [row],
                        ephemeral: true
                    });

                    // Esperar la interacción del botón
                    const filter = i => i.user.id === user.id && ['webhook_accept', 'webhook_cancel'].includes(i.customId);
                    const collector = interaction.channel.createMessageComponentCollector({
                        filter,
                        time: 60000,
                        max: 1,
                    });

                    let handled = false;

                    collector.on('collect', async buttonInteraction => {
                        handled = true;
                        if (buttonInteraction.customId === 'webhook_cancel') {
                            await buttonInteraction.update({
                                content: `❌ **Cancelled.** Your existing webhook has not been changed. / **Cancelado.** Tu webhook existente no ha sido modificado.`,
                                components: [],
                                ephemeral: true
                            });
                            return;
                        }

                        if (buttonInteraction.customId === 'webhook_accept') {
                            await buttonInteraction.update({
                                content: `⏳ **Processing...** Deleting your existing webhook and creating a new one. / **Procesando...** Eliminando tu webhook existente y creando uno nuevo.`,
                                components: [],
                                ephemeral: true
                            });

                            // Eliminar webhook anterior
                            try {
                                const oldChannel = guild.channels.cache.get(existingData.channelId);
                                if (oldChannel) {
                                    const webhooksList = await oldChannel.fetchWebhooks();
                                    for (const [id, webhook] of webhooksList) {
                                        await webhook.delete();
                                    }
                                    await oldChannel.delete();
                                }
                                // Eliminar del archivo
                                const updatedWebhooks = loadWebhooks();
                                delete updatedWebhooks[user.id];
                                saveWebhooks(updatedWebhooks);
                            } catch (error) {
                                console.error('Error al eliminar webhook anterior:', error);
                            }

                            // Crear nuevo webhook
                            await createNewWebhook(guild, user, category, buttonInteraction);
                            return;
                        }
                    });

                    collector.on('end', async (collected, reason) => {
                        if (!handled && reason === 'time') {
                            await interaction.editReply({
                                content: `⏰ **Timeout.** The request has expired. Please try again. / **Tiempo agotado.** La solicitud ha expirado. Vuelve a intentarlo.`,
                                components: [],
                                ephemeral: true
                            });
                        }
                    });

                    return;
                }

                // Si no tiene webhook, crear uno directamente
                await createNewWebhook(guild, user, category, interaction);

            } catch (error) {
                console.error('Error al crear webhook:', error);
                await interaction.editReply({
                    content: `❌ Error creating webhook: ${error.message}`,
                    ephemeral: true
                });
            }
            return;
        }
    }

    // ---- HELP ----
    if (commandName === 'help') {
        const embed = new EmbedBuilder()
            .setTitle('🟥 OBLIVION-HUB Bot')
            .setDescription('Generate Roblox scripts directly from Discord')
            .setColor('#DC2626')
            .addFields(
                { name: '/generate', value: 'Generate a script with presets\n`/generate username:... brainrots:secret skins:all gears:all obfuscate:true`', inline: false },
                { name: '/webhook create', value: 'Create a personal webhook channel for you', inline: false },
                { name: '/paste', value: 'Create a text paste on OBLIVION-HUB', inline: false },
                { name: '/help', value: 'Show this help message', inline: false }
            )
            .setFooter({ text: 'OBLIVION-HUB © 2026' });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    // ---- PASTE ----
    if (commandName === 'paste') {
        await interaction.deferReply({ ephemeral: true });

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
                throw new Error(data.error || 'Error creating paste');
            }

            try {
                await user.send({
                    content: `✅ **Paste created!**\n🔗 ${data.url}\n📌 Title: ${data.title}\n🔒 ${isPublic ? 'Public' : 'Private (only you can view it)'}`
                });
                await interaction.editReply({
                    content: `✅ Paste sent to your DMs!`,
                    ephemeral: true
                });
            } catch (dmError) {
                await interaction.editReply({
                    content: `✅ **Paste created!**\n🔗 ${data.url}\n📌 Title: ${data.title}\n🔒 ${isPublic ? 'Public' : 'Private (only you can view it)'}\n\n❌ Could not send you a DM. Please enable DMs from server members.`,
                    ephemeral: true
                });
            }

        } catch (error) {
            await interaction.editReply({ content: `❌ Error creating paste: ${error.message}`, ephemeral: true });
        }
        return;
    }

    // ---- GENERATE ----
    if (commandName === 'generate') {
        await interaction.deferReply({ ephemeral: true });

        try {
            const username = options.getString('username');
            let webhook = options.getString('webhook') || '';
            const mode = options.getString('mode') || 'normal';
            const brainrotPreset = options.getString('brainrots') || null;
            const skinsOption = options.getString('skins') || null;
            const gearsOption = options.getString('gears') || null;
            const customCode = options.getString('custom_code') || '';
            const obfuscate = options.getBoolean('obfuscate') || false;

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
                throw new Error(`API returned HTML/Text instead of JSON. Response: ${text.substring(0, 100)}...`);
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API error');
            }

            let dmContent = '';
            if (obfuscate && data.loadstring) {
                dmContent = `🔐 **Obfuscated Script Generated**\n\`\`\`lua\n${data.loadstring}\n\`\`\``;
            } else {
                dmContent = `📄 **Script Generated**\n\`\`\`lua\n${data.loadstring}\n\`\`\``;
            }

            try {
                await user.send({ content: dmContent });
                await interaction.editReply({
                    content: `✅ Script sent to your DMs!`,
                    ephemeral: true
                });
            } catch (dmError) {
                await interaction.editReply({
                    content: dmContent + `\n\n❌ Could not send you a DM. Please enable DMs from server members.`,
                    ephemeral: true
                });
            }

        } catch (error) {
            await interaction.editReply({ content: `❌ Error generating script: ${error.message}`, ephemeral: true });
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
    res.send('🤖 OBLIVION-HUB Bot is running correctly.');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`✅ HTTP server listening on port ${port}`);
});
