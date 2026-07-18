import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan teks atau pertanyaanmu!\n┊ ☁️ Contoh: *${usedPrefix + command} halo cuy*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apikey = 'x34J0';
        const model = 'gpt-5';
        const apiUrl = `https://api.theresav.biz.id/ai/copilot?text=${encodeURIComponent(text)}&model=${model}&apikey=${apikey}`;

        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.status || !json.result || !json.result.text) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mendapatkan respon dari Copilot AI.\n╰────────────────────── ⋆ ✧');
        }

        // Mengirimkan hasil teks langsung ke user
        await m.reply(json.result.text);
        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses permintaan.\n╰────────────────────── ⋆ ✧');
    }
};

handler.help = ['copilot <text>'];
handler.tags = ['ai'];
handler.command = /^copilot$/i;
handler.limit = true;

export default handler;