import { exec } from 'child_process';
import fs from 'fs';

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!/webp|image/i.test(mime)) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Balas stiker atau dokumen gambar yang ingin dijadikan foto!\n┊ ☁️ Contoh: *${usedPrefix + command}*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        let media = await q.download();

        if (!/webp/i.test(mime)) {
            await conn.sendMessage(m.chat, { image: media, caption: '> 🌸 *Li Shiya MD - Tools* 🌸' }, { quoted: m });
            return await m.react('✅');
        }

        let ran = Date.now();
        let tempWebp = `./${ran}.webp`;
        let tempPng = `./${ran}.png`;

        fs.writeFileSync(tempWebp, media);

        exec(`ffmpeg -i ${tempWebp} ${tempPng}`, async (err) => {
            if (fs.existsSync(tempWebp)) fs.unlinkSync(tempWebp);
            
            if (err) {
                console.error(err);
                await m.react('❌');
                return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengkonversi stiker ke foto.\n┊ _Pastikan ffmpeg terinstall di server/panel kamu._\n╰────────────────────── ⋆ ✧`);
            }

            let buffer = fs.readFileSync(tempPng);
            await conn.sendMessage(m.chat, { image: buffer, caption: '> 🌸 *Li Shiya MD - Tools* 🌸' }, { quoted: m });
            
            if (fs.existsSync(tempPng)) fs.unlinkSync(tempPng);
            await m.react('✅');
        });
        
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses media.\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['toimage', 'toimg'];
handler.tags = ['tools'];
handler.command = /^(toim(age|g)?)$/i;
handler.limit = true;

export default handler;