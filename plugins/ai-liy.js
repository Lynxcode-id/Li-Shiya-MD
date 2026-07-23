import axios from 'axios';

let chatCooldowns = new Map();

let handler = async (m, { conn, text, usedPrefix, command }) => {
    global.db.data.chats = global.db.data.chats || {};
    let chat = global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
    chat.autoai = chat.autoai || false;

    let args = text.toLowerCase().trim();

    if (args === 'on' || args === 'enable') {
        if (chat.autoai) return m.reply('╭── ⋆ ✧ ꒰ 🎀 *AUTO AI* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Auto AI di chat ini sudah *AKTIF* dari tadi, cuy!\n╰────────────────────── ⋆ ✧');
        chat.autoai = true;
        return m.reply('╭── ⋆ ✧ ꒰ 🎀 *AUTO AI* 🎀 ꒱ ✧ ⋆ ──\n┊ ✨ Berhasil *MENGAKTIFKAN* Auto AI di chat ini!\n┊ ☁️ Sekarang aku bakal otomatis nanggepin setiap chat yang masuk ya.\n╰────────────────────── ⋆ ✧');
    } else if (args === 'off' || args === 'disable') {
        if (!chat.autoai) return m.reply('╭── ⋆ ✧ ꒰ 🎀 *AUTO AI* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Auto AI di chat ini emang lagi *MATI*, ih!\n╰────────────────────── ⋆ ✧');
        chat.autoai = false;
        return m.reply('╭── ⋆ ✧ ꒰ 🎀 *AUTO AI* 🎀 ꒱ ✧ ⋆ ──\n┊ 💤 Berhasil *MEMATIKAN* Auto AI di chat ini.\n╰────────────────────── ⋆ ✧');
    }

    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan pertanyaan atau ketik *${usedPrefix + command} on / off*!\n┊ ☁️ Contoh: *${usedPrefix + command} halo* atau *${usedPrefix + command} on*\n╰────────────────────── ⋆ ✧`);
    }

    await processAIResponse(m, text);
};

handler.before = async function (m, { conn }) {
    if (m.isBaileys || m.fromMe) return;
    if (!m.text) return;

    global.db.data.chats = global.db.data.chats || {};
    let chat = global.db.data.chats[m.chat];
    if (!chat || !chat.autoai) return;

    let prefix = /^[°•π÷×¶∆£¢€¥®™+=|~<>;,!#./?-]/;
    if (prefix.test(m.text)) return;

    let now = Date.now();
    let cooldownTime = 3000;
    if (chatCooldowns.has(m.chat)) {
        let lastTime = chatCooldowns.get(m.chat);
        if (now - lastTime < cooldownTime) return;
    }
    chatCooldowns.set(m.chat, now);

    await processAIResponse(m, m.text);
    return true;
};

async function processAIResponse(m, text) {
    await m.react('🌼');

    try {
        let encodedQuery = encodeURIComponent(text.trim());
        let url = `https://api.kaicloud.my.id/api/ai/unlimited?q=${encodedQuery}`;

        const headers = {
            'accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
        };

        const { data } = await axios.get(url, { headers, timeout: 30000 });

        if (!data?.status || !data?.data?.response) {
            throw new Error("Respons kosong dari server AI.");
        }

        let answer = data.data.response.trim();
        let usedModel = data.data.model_used || 'chat-model-reasoning';

        const header = `╭── ⋆ ✧ ꒰ 🎀 *${usedModel.toUpperCase()}* 🎀 ꒱ ✧ ⋆ ──\n\n`;
        const footer = `\n\n╰────────────────────── ⋆ ✧\n\n> 🌸 *Li Shiya MD - Advanced AI Tools* 🌸`;

        await m.reply(header + answer + footer);
        await m.react('🌸');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        let errorMessage = err?.response?.data?.message || err.message;
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ AI sedang mengalami kendala.\n┊ _${errorMessage}_\n╰────────────────────── ⋆ ✧`);
    }
}

handler.help = ['liy <query>', 'liy on', 'liy off'];
handler.tags = ['ai'];
handler.command = /^(liy)$/i;
handler.limit = true;

export default handler;