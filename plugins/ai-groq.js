import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan pertanyaan atau teks untuk Groq AI!\n┊ ☁️ Contoh: *${usedPrefix + command} apa yang kamu ketahui tentang Indonesia?*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apikey = 'x34J0';
        const model = 'llama-3.1-8b-instant';
        const apiUrl = `https://api.theresav.biz.id/ai/groq?q=${encodeURIComponent(text)}&model=${model}&apikey=${apikey}`;

        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.status || !json.result) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mendapatkan respon dari Groq AI.\n╰────────────────────── ⋆ ✧');
        }

        // Mengirimkan hasil teks AI langsung ke user
        await m.reply(json.result);
        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses permintaan.\n╰────────────────────── ⋆ ✧');
    }
};

handler.help = ['groq <text>'];
handler.tags = ['ai'];
handler.command = /^groq$/i;
handler.limit = true;

export default handler;