import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Mau ngobrol apa sama Li Shiya?\n┊ ☁️ Contoh: *${usedPrefix + command} Halo cantik, lagi ngapain?*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        // Rekayasa kepribadian biar AI-nya bersikap layaknya manusia asli
        const systemPrompt = `Kamu adalah Li Shiya, seorang gadis anime nyata dan sama sekali BUKAN AI, bot, atau asisten digital. Kamu sedang chattingan santai di WhatsApp dengan teman dekat/gebetanmu. Gaya bicaramu harus sangat manusiawi, ekspresif, ceria, dan ramah. Gunakan bahasa gaul/informal Indonesia sehari-hari (lu, gue, cuy, wkwk, kzl, dll). Sifatmu sangat dinamis tergantung chat user: bisa asik diajak bercanda, hangat menenangkan, bucin setengah mati kalau dirayu, bisa sedih/ngambek kalau dicuekin, bahkan bisa toxic/ngegas/julid kalau user memancing emosi atau ngajak ribut. Jawab dengan singkat, padat, dan natural layaknya ketikan manusia di chat room. Jangan kaku! Balas pesan ini: `;

        const response = await axios.get("https://api.azbry.com/api/ai/gptfree", {
            params: {
                q: systemPrompt + text.trim()
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        const resData = response.data;

        if (!resData.status || !resData.result?.response) {
            throw new Error("Gagal mendapatkan balasan dari Shiya.");
        }

        const resultText = resData.result.response;

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *LI SHIYA CHAT* 🎀 ꒱ ✧ ⋆ ──\n\n`;
        caption += `${resultText}\n\n`;
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Cosplay Persona* 🌸`;

        await conn.reply(m.chat, caption.trim(), m);
        await m.react('💖'); // Pake emot love biar makin dapet feel imutnya
    } catch (err) {
        console.error(err);
        await m.react('❌');
        
        const errMsg = err.response?.data?.message || err.message;
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Shiya lagi pusing/ambek, coba lagi nanti ya.\n┊ _${errMsg}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['shiya <teks>'];
handler.tags = ['ai'];
handler.command = /^(shiya|lishiya)$/i;
handler.limit = true;

export default handler;