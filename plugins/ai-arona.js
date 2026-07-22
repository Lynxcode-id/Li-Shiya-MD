import axios from 'axios';

const handler = async (m, { text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan teks untuk berbicara dengan Arona!\n┊ ☁️ Contoh: *${usedPrefix + command} halo arona*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('🌼');

    try {
        const response = await axios.get("https://www.sankavollerei.web.id/ai/arona", {
            params: {
                apikey: 'planaai',
                text: text
            },
            timeout: 30000
        });

        if (!response.data.status) throw new Error("Gagal mendapatkan respon dari Arona.");

        await m.reply(response.data.result);
        await m.react('🌸');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['arona'];
handler.tags = ['ai'];
handler.command = /^arona$/i;

export default handler;