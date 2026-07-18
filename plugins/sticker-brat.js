import { bratGen } from 'brat-canvas';
import { create } from '@itsliaaa/starseal';

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let txt = text || (m.quoted ? m.quoted.text : '');
    if (!txt) return m.reply(`⚠️ Masukkan teks! Contoh: *${usedPrefix + command} halo*`);

    await m.react('⚡');

    try {
        const bratResult = await bratGen(txt);
        const rawBuffer = Buffer.from(bratResult.buffer ? bratResult.buffer : bratResult);
        const stickerBuffer = await create(rawBuffer, {
            packName: global.stickpack || 'Brat',
            publisherName: global.stickauth || 'Li Shiya',
        })
        .toBuffer();

        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });
        await m.react('✅');

    } catch (err) {
        console.error("Error Starseal:", err);
        await m.react('❌');
        m.reply(`❌ *Gagal memproses Brat.*`);
    }
};

handler.command = /^(brat)$/i;
handler.limit = true;

export default handler;