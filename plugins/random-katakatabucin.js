import axios from 'axios';

const handler = async (m, { conn }) => {
    await m.react('⏳');

    try {
        const { data } = await axios.get("https://api-faa.my.id/faa/quote-bucin", {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        if (!data?.status || !data?.quote) {
            throw new Error("Gagal mengambil quote dari API.");
        }

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *QUOTE BUCIN* 🎀 ꒱ ✧ ⋆ ──\n` +
                        `┊ "${data.quote}"\n` +
                        `╰────────────────────── ⋆ ✧\n` +
                        `> 🌸 *Li Shiya MD - Fun Tools* 🌸`;

        await m.reply(caption.trim());
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengambil quote bucin.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['quotebucin'];
handler.tags = ['random'];
handler.command = /^(quotebucin|katakatabucin)$/i;
handler.limit = true;

export default handler;