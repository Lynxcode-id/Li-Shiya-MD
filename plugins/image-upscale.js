import axios from 'axios';
import FormData from 'form-data';

const handler = async (m, { conn, usedPrefix, command }) => {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';

    if (!mime || !mime.includes('image')) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Kirim atau balas gambar yang ingin di-upscale!\n┊ ☁️ Contoh: *${usedPrefix + command}*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('🌼');

    try {
        const media = await q.download();
        if (!media) throw new Error("Gagal mengunduh gambar dari pesan.");

        const form = new FormData();
        form.append('image', media, 'image.jpg');
        form.append('url', ''); 

        const response = await axios.post("https://api.kyzzz.eu.cc/api/tools/upscale", form, {
            params: {
                apikey: 'kyzz824425738250'
            },
            responseType: 'arraybuffer', 
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            timeout: 60000 
        });

        const contentType = response.headers['content-type'] || '';
        let imageMedia;

        if (contentType.includes('application/json')) {
            const data = JSON.parse(Buffer.from(response.data).toString('utf-8'));
            if (!data.status) throw new Error("Gagal memproses gambar ke server Kyzz.");
            imageMedia = { url: data.result || data.url };
        } else {
            imageMedia = Buffer.from(response.data, 'binary');
        }

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *KYZZ UPSCALER* 🎀 ꒱ ✧ ⋆ ──\n` +
                        `╰────────────────────── ⋆ ✧\n` +
                        `> 🌸 *Li Shiya MD - HD Tools* 🌸`;

        await conn.sendMessage(m.chat, {
            image: imageMedia.url ? { url: imageMedia.url } : imageMedia,
            caption: caption.trim()
        }, { quoted: m });

        await m.react('🌸');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal melakukan upscale gambar.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['upscale'];
handler.tags = ['image'];
handler.command = /^upscale$/i;
handler.limit = true;

export default handler;