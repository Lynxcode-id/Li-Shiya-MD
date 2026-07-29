import fetch from 'node-fetch';
import FormData from 'form-data';

const handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Kirim atau balas gambar yang ingin ditingkatkan kualitasnya!\n┊ ☁️ Contoh: Balas gambar dengan caption *${usedPrefix + command}*\n╰────────────────────── ⋆ ✧`);
    }

    if (!/image\/(jpe?g|png)/.test(mime)) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Format media tidak didukung! Pastikan berupa gambar (JPG/PNG).\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const imgBuffer = await q.download();
        const apikey = 'Lynxdecode';
        const apiUrl = `https://api.jerexd.my.id/api/ai/wink?apikey=${apikey}`;

        // Menggunakan FormData untuk mengirim buffer gambar langsung ke API tanpa uploader eksternal
        const form = new FormData();
        form.append('file', imgBuffer, {
            filename: 'wink_input.jpg',
            contentType: mime
        });

        const response = await fetch(apiUrl, {
            method: 'POST',
            body: form,
            headers: {
                ...form.getHeaders()
            }
        });

        const json = await response.json();

        if (!json.status || !json.resultUrl) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal meningkatkan kualitas gambar menggunakan Wink AI.\n╰────────────────────── ⋆ ✧');
        }

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *WINK AI ENHANCER* 🎀 ꒱ ✧ ⋆ ──
┊ ✨ Berhasil memperjelas dan meningkatkan resolusi gambar!
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Wink AI*`.trim();

        await conn.sendMessage(m.chat, { 
            image: { url: json.resultUrl }, 
            caption: caption 
        }, { quoted: m });
        
        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses gambar.\n╰────────────────────── ⋆ ✧');
    }
};

handler.help = ['wink'];
handler.tags = ['image'];
handler.command = /^wink$/i;
handler.limit = true;

export default handler;