import axios from 'axios';
import FormData from 'form-data';

const handler = async (m, { conn, usedPrefix, command, args }) => {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';

    if (!mime || !mime.includes('image')) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Kirim atau balas gambar yang ingin di-HD-kan!\n┊ ☁️ Contoh: *${usedPrefix + command}*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const media = await q.download();
        if (!media) throw new Error("Gagal mengunduh gambar.");

        const form = new FormData();
        form.append('file', media, 'image.jpg');

        const { data } = await axios.post("https://api.jerexd.my.id/api/tools/hd", form, {
            params: {
                apikey: 'Lynxdecode',
                scale: 4 // Scale default 4 sesuai request
            },
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            timeout: 60000 // Timeout dilamain karena proses HD butuh waktu
        });

        if (!data?.status || !data?.result?.upscaled_url) {
            throw new Error("Gagal memproses gambar ke server HD.");
        }

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *IMAGE UPSCALER* 🎀 ꒱ ✧ ⋆ ──\n` +
                        `┊ 📈 *Scale* : ${data.result.scale_applied || '4x'}\n` +
                        `┊ ⚙️ *Engine* : ${data.result.engine || 'Picsart'}\n` +
                        `╰────────────────────── ⋆ ✧\n` +
                        `> 🌸 *Li Shiya MD - HD Tools* 🌸`;

        await conn.sendMessage(m.chat, {
            image: { url: data.result.upscaled_url },
            caption: caption.trim()
        }, { quoted: m });

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal meningkatkan resolusi gambar.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['hd'];
handler.tags = ['image'];
handler.command = /^hd$/i;
handler.limit = true;

export default handler;