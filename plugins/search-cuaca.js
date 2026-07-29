import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan nama lokasi/kota yang ingin dicari!\n┊ ☁️ Contoh: *${usedPrefix + command} Makassar*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('🌼');

    try {
        const { data } = await axios.get("https://api.jagoanproject.com/api/search/cuaca", {
            params: { text: text.trim() },
            headers: {
                'Authorization': 'Bearer Lynxdecode',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            timeout: 30000
        });

        if (!data?.status || !data?.result) {
            throw new Error("Data cuaca untuk lokasi tersebut tidak ditemukan.");
        }

        const result = data.result;

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *WEATHER INFO* 🎀 ꒱ ✧ ⋆ ──\n` +
                        `┊ 📍 *Lokasi* : ${result.lokasi || '-'}\n` +
                        `┊ 🌤️ *Cuaca* : ${result.cuaca || '-'}\n` +
                        `┊ 🌡️ *Suhu* : ${result.suhu || '-'}\n` +
                        `┊ 💧 *Kelembapan* : ${result.kelembapan || '-'}\n` +
                        `┊ 💨 *Angin* : ${result.angin || '-'}\n` +
                        `┊ 📉 *Tekanan Udara* : ${result.tekanan_udara || '-'}\n` +
                        `┊ ⏰ *Zona Waktu* : ${result.zona_waktu || '-'}\n` +
                        `╰────────────────────── ⋆ ✧\n\n` +
                        `> 🌸 *Li Shiya MD - Weather Tools* 🌸`;

        if (result.icon) {
            await conn.sendMessage(m.chat, {
                image: { url: result.icon },
                caption: caption.trim()
            }, { quoted: m });
        } else {
            await m.reply(caption.trim());
        }

        await m.react('🌸');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengambil data cuaca.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['cekcuaca <lokasi>', 'weathercek <lokasi>'];
handler.tags = ['search'];
handler.command = /^(cekcuaca|weathercek)$/i;
handler.limit = true;

export default handler;