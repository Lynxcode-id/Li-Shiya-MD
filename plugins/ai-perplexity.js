import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan pertanyaan atau teks untuk Perplexity AI!\n┊ ☁️ Contoh: *${usedPrefix + command} Apa itu black hole?*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        conn.perplexitySession = conn.perplexitySession || {};
        const currentSession = conn.perplexitySession[m.sender] || '';

        const response = await axios.get("https://apis.snowping.eu.cc/api/aichat/aiperplexity", {
            params: {
                q: text.trim(),
                sessionId: currentSession
            }
        });

        const resData = response.data;

        if (resData.status !== 200 || !resData.result) {
            throw new Error("Gagal mengambil data dari API.");
        }

        const { answer, sessionId } = resData.result;

        if (sessionId) {
            conn.perplexitySession[m.sender] = sessionId;
        }

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *PERPLEXITY AI RESPONSE* 🎀 ꒱ ✧ ⋆ ──\n\n`;
        caption += `${answer}\n\n`;
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - AI Assistant* 🌸`;

        await conn.reply(m.chat, caption.trim(), m);
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        
        const errMsg = err.response?.data?.message || err.message;
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mendapatkan respon dari Perplexity AI.\n┊ _${errMsg}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['perplexity <teks>'];
handler.tags = ['ai'];
handler.command = /^(perplexity|pplx|aipplx)$/i;
handler.limit = true;

export default handler;