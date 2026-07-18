import axios from 'axios';

const handler = async (m, { conn }) => {
    await m.react('⏳');

    try {
        const response = await axios.get("https://api.azbry.com/api/random/fakta");
        const resData = response.data;

        if (!resData.status || !resData.result?.fakta) {
            throw new Error("Gagal mengambil fakta dari API.");
        }

        const fakta = resData.result.fakta;

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *FAKTA RANDOM* 🎀 ꒱ ✧ ⋆ ──\n\n`;
        caption += `💡 ${fakta}\n\n`;
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Fun Tools* 🌸`;

        await conn.reply(m.chat, caption.trim(), m);
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        
        const errMsg = err.response?.data?.message || err.message;
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mendapatkan fakta random.\n┊ _${errMsg}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['faktarandom'];
handler.tags = ['random'];
handler.command = /^(faktarandom|randomfakta)$/i;
handler.limit = true;

export default handler;