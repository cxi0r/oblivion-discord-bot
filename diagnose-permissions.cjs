'use strict';

// Solo consultas GET a Discord; no crea ni modifica canales, roles o webhooks.
const FLAGS = {
    Administrator: 1n << 3n,
    ManageChannels: 1n << 4n,
    ViewChannel: 1n << 10n,
    SendMessages: 1n << 11n,
    ManageMessages: 1n << 13n,
    EmbedLinks: 1n << 14n,
    AttachFiles: 1n << 15n,
    ReadMessageHistory: 1n << 16n,
    UseExternalEmojis: 1n << 18n,
    ManageRoles: 1n << 28n,
    ManageWebhooks: 1n << 29n
};
const LABELS = {
    ViewChannel: 'Ver canales', ManageChannels: 'Gestionar canales',
    ManageWebhooks: 'Gestionar webhooks', ManageMessages: 'Gestionar mensajes',
    SendMessages: 'Enviar mensajes', ReadMessageHistory: 'Leer historial',
    EmbedLinks: 'Insertar enlaces', AttachFiles: 'Adjuntar archivos',
    UseExternalEmojis: 'Emojis externos', ManageRoles: 'Gestionar roles/permisos',
    Administrator: 'Administrador'
};
const REQUIRED = ['ViewChannel', 'ManageChannels', 'ManageWebhooks', 'ManageMessages',
    'SendMessages', 'ReadMessageHistory', 'EmbedLinks', 'AttachFiles'];
const has = (bits, flag) => (bits & FLAGS.Administrator) !== 0n || (bits & flag) === flag;
function basePermissions(guildId, member, roles) {
    const ids = new Set([guildId, ...member.roles]);
    return roles.filter(role => ids.has(role.id)).reduce((bits, role) => bits | BigInt(role.permissions), 0n);
}
function channelPermissions(base, guildId, member, botId, channel) {
    if (has(base, FLAGS.Administrator)) return base;
    const overwrites = channel.permission_overwrites || [];
    const apply = (bits, deny, allow) => (bits & ~BigInt(deny || 0)) | BigInt(allow || 0);
    const everyone = overwrites.find(item => Number(item.type) === 0 && item.id === guildId);
    let bits = everyone ? apply(base, everyone.deny, everyone.allow) : base;
    const roleIds = new Set(member.roles);
    let allow = 0n, deny = 0n;
    for (const item of overwrites) {
        if (Number(item.type) === 0 && item.id !== guildId && roleIds.has(item.id)) {
            allow |= BigInt(item.allow || 0); deny |= BigInt(item.deny || 0);
        }
    }
    bits = apply(bits, deny, allow);
    const personal = overwrites.find(item => Number(item.type) === 1 && item.id === botId);
    return personal ? apply(bits, personal.deny, personal.allow) : bits;
}
async function diagnose(env = process.env, fetcher = require('node-fetch'), output = console.log) {
    const token = env.TOKEN;
    const guildId = env.GUILD_ID;
    if (!token || !/^\d+$/.test(guildId || '')) {
        output('Falta TOKEN o GUILD_ID no es valido. No se muestran sus valores.');
        return false;
    }
    async function get(route) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);
        try {
            const response = await fetcher(`https://discord.com/api/v10${route}`, {
                method: 'GET', redirect: 'error', signal: controller.signal,
                headers: { Authorization: `Bot ${token}`, 'User-Agent': 'DiscordBot (https://github.com/cxi0r/oblivion-discord-bot, 1.0)' }
            });
            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                const code = Number.isInteger(body.code) ? body.code : 'sin codigo';
                throw new Error(`HTTP ${response.status}; Discord ${code}`);
            }
            return await response.json();
        } finally { clearTimeout(timer); }
    }
    const bot = await get('/users/@me');
    const [guild, member, roles, channels] = await Promise.all([
        get(`/guilds/${guildId}`), get(`/guilds/${guildId}/members/${bot.id}`),
        get(`/guilds/${guildId}/roles`), get(`/guilds/${guildId}/channels`)
    ]);
    const base = basePermissions(guildId, member, roles);
    const categories = channels.filter(channel => channel.type === 4 && channel.name.startsWith('webhook '))
        .sort((a, b) => (parseInt(b.name.split(' ')[1]) || 0) - (parseInt(a.name.split(' ')[1]) || 0));
    const category = categories[0];
    const effective = category ? channelPermissions(base, guildId, member, bot.id, category) : base;
    output(`Commit: ${env.RAILWAY_GIT_COMMIT_SHA || 'no disponible'}`);
    output(`Bot real: ${bot.username} (${bot.id}); CLIENT_ID coincide: ${bot.id === env.CLIENT_ID ? 'SI' : 'NO'}`);
    output(`Servidor: ${guild.name} (${guild.id})`);
    output(`Roles del bot: ${roles.filter(role => member.roles.includes(role.id)).map(role => role.name).join(', ') || 'ninguno'}`);
    output(`Categoria seleccionada: ${category ? `${category.name} (${category.id})` : 'se creara una nueva'}`);
    output(`Timeout del bot: ${member.communication_disabled_until || 'ninguno'}; MFA servidor: ${guild.mfa_level}`);
    output('PERMISO | SERVIDOR | CATEGORIA');
    for (const [name, label] of Object.entries(LABELS)) {
        output(`${label} | ${has(base, FLAGS[name]) ? 'SI' : 'NO'} | ${has(effective, FLAGS[name]) ? 'SI' : 'NO'}`);
    }
    const missing = REQUIRED.filter(name => !has(base, FLAGS[name]));
    output(`Faltan a nivel servidor para el canal privado actual: ${missing.map(name => LABELS[name]).join(', ') || 'ninguno'}`);
    return true;
}
if (require.main === module) {
    diagnose().then(ok => { if (!ok) process.exitCode = 1; }).catch(error => {
        // Los errores de red pueden contener datos internos; solo mostrar mensajes propios de HTTP.
        console.error(/^HTTP \d+; Discord /.test(error.message) ? error.message : 'Fallo la consulta de diagnostico. No se imprimen credenciales.');
        process.exitCode = 1;
    });
}
module.exports = { FLAGS, has, basePermissions, channelPermissions, diagnose };
