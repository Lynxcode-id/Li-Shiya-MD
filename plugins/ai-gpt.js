import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan pertanyaan atau teks untuk GPT Free!\n┊ ☁️ Contoh: *${usedPrefix + command} Apa itu AI?*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const response = await axios.get("https://api.azbry.com/api/ai/gptfree", {
            params: {
                q: text.trim()
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        const resData = response.data;

        if (!resData.status || !resData.result?.response) {
            throw new Error("Gagal mengambil respon dari API.");
        }

        const resultText = resData.result.response;

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *GPT FREE RESPONSE* 🎀 ꒱ ✧ ⋆ ──\n\n`;
        caption += `${resultText}\n\n`;
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - AI Assistant* 🌸`;

        await conn.reply(m.chat, caption.trim(), m);
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        
        const errMsg = err.response?.data?.message || err.message;
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mendapatkan respon dari GPT Free.\n┊ _${errMsg}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['gpt <teks>'];
handler.tags = ['ai'];
handler.command = /^(gpt)$/i;
handler.limit = true;

export default handler;