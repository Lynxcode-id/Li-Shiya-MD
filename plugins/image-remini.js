/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Remini AI Photo Enhancer (Li Shiya UI)
 */

import fetch from 'node-fetch';
import uploadImage from '../lib/uploadImage.js';

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
        const uploadedUrl = await uploadImage(imgBuffer);

        if (!uploadedUrl) {
            throw new Error("Gagal mengunggah gambar ke uploader internal.");
        }

        const apikey = 'Lynxdecode';
        const apiUrl = `https://api.jagoanproject.com/api/tools/remini?image_url=${encodeURIComponent(uploadedUrl)}`;

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${apikey}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        const json = await response.json();

        if (!json.status || !json.data || !json.data.results) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal memperjelas gambar menggunakan Remini AI.\n╰────────────────────── ⋆ ✧');
        }

        const results = json.data.results;
        const successResult = results.find(r => r.status === true);

        if (!successResult) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Semua provider gagal memproses gambar Anda.\n╰────────────────────── ⋆ ✧');
        }

        const scale = json.data.scale || '4x';
        const providerName = successResult.provider.toUpperCase();

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *REMINI AI ENHANCER* 🎀 ꒱ ✧ ⋆ ──
┊ ✨ Berhasil memperjelas dan menajamkan gambar!
┊ 
┊ 🔍 *Skala* : ${scale}
┊ 🔮 *Provider* : ${providerName}
┊ ⚙️ *Status* : Sukses (Clear & Detailed)
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Remini AI* 🌸`.trim();

        await conn.sendMessage(m.chat, { 
            image: { url: successResult.url }, 
            caption: caption 
        }, { quoted: m });
        
        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses gambar menggunakan Remini AI.\n╰────────────────────── ⋆ ✧');
    }
};

handler.help = ['remini'];
handler.tags = ['image'];
handler.command = /^remini$/i;
handler.limit = true;

export default handler;