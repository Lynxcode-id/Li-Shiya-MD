import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan pertanyaan atau teks untuk AI Dola!\n┊ ☁️ Contoh: *${usedPrefix + command} Apa itu kecerdasan buatan?*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const response = await axios.get("https://fgsi.dpdns.org/api/ai/dola", {
            params: {
                apikey: "fgsiapi-e1921b2-6d",
                text: text.trim(),
            },
            headers: {
                accept: "application/json",
            },
        });

        const resData = response.data;
        
        const resultText = resData.answer || resData.result || resData.data || resData.response || 
                           (typeof resData === 'object' ? (resData.text || resData.message || JSON.stringify(resData)) : resData);

        if (!resultText) {
            throw new Error("API tidak mengembalikan respon teks yang valid.");
        }

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *AI DOLA RESPONSE* 🎀 ꒱ ✧ ⋆ ──\n\n`;
        caption += `${resultText}\n\n`;
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - AI Assistant* 🌸`;

        await conn.reply(m.chat, caption.trim(), m);
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        
        const errMsg = err.response?.data?.message || err.response?.data || err.message;
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mendapatkan respon dari AI Dola.\n┊ _${typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['dola <teks>'];
handler.tags = ['ai'];
handler.command = /^(dola|aidola)$/i;
handler.limit = true;

export default handler;