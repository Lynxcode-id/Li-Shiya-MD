import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan teks atau pertanyaanmu!\n┊ ☁️ Contoh: *${usedPrefix + command} halo bro apa kabar*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        conn.claude = conn.claude || {};
        const userId = m.sender;
        const sessionId = conn.claude[userId] || '';

        const apikey = 'x34J0';
        let apiUrl = `https://api.theresav.biz.id/ai/claude?text=${encodeURIComponent(text)}&apikey=${apikey}`;
        
        // Mengirimkan chatId jika sesi percakapan sebelumnya sudah ada agar obrolan berlanjut (continuous chat)
        if (sessionId) {
            apiUrl += `&chatId=${sessionId}`;
        }

        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.status || !json.result) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mendapatkan respon dari Claude AI.\n╰────────────────────── ⋆ ✧');
        }

        // Menyimpan chatId untuk menjaga kelanjutan sesi percakapan user
        if (json.chatId) {
            conn.claude[userId] = json.chatId;
        }

        await m.reply(json.result);
        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses permintaan.\n╰────────────────────── ⋆ ✧');
    }
};

handler.help = ['claude <text>'];
handler.tags = ['ai'];
handler.command = /^claude$/i;
handler.limit = true;

export default handler;