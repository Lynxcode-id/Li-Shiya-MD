import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const handler = async (m, { conn, usedPrefix, command }) => {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';

    if (!mime || !/(video|document|webp)/.test(mime)) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Balas dokumen video, video, atau stiker!\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    let tmpIn = join(tmpdir(), `${Date.now()}_in.mp4`);
    let tmpOut = join(tmpdir(), `${Date.now()}_out.mp4`);

    try {
        const media = await q.download();
        await fs.writeFile(tmpIn, media);

        // Pengecekan apakah FFmpeg tersedia
        try {
            await execPromise('ffmpeg -version');
        } catch (e) {
            throw new Error("FFmpeg tidak terinstall di server/VPS kamu cuy!");
        }

        // Jalankan FFmpeg dengan log error yang lebih jelas
        await execPromise(`ffmpeg -i "${tmpIn}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -pix_fmt yuv420p -c:a aac -y "${tmpOut}"`);

        // Cek apakah file benar-benar ada sebelum dibaca
        await fs.access(tmpOut);

        const vidBuffer = await fs.readFile(tmpOut);

        await conn.sendMessage(m.chat, {
            video: vidBuffer,
            mimetype: 'video/mp4',
            caption: `> 🌸 *Li Shiya MD - Fixed* 🌸`
        }, { quoted: m });

        await m.react('✅');

    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal: ${err.message}\n╰────────────────────── ⋆ ✧`);
    } finally {
        // Bersihkan file
        [tmpIn, tmpOut].forEach(file => {
            fs.unlink(file).catch(() => {});
        });
    }
};

handler.help = ['tovideo'];
handler.tags = ['tools'];
handler.command = /^(tovideo|tovid)$/i;
handler.limit = true;

export default handler;