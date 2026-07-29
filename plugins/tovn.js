const handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    if (!/video|audio/.test(mime)) {
        return m.reply(`Balas audio atau video dengan perintah *${usedPrefix + command}* cuy!`);
    }

    await m.react('⏳');
    
    try {
        let media = await q.download?.();
        if (!media) throw new Error('Waduh, gagal mendownload media nih.');
        await conn.sendFile(m.chat, media, 'vn.ogg', '', m, true, { mimetype: 'audio/ogg; codecs=opus' });
        
        await m.react('✅');
    } catch (e) {
        console.error(e);
        m.reply('Gagal nge-convert ke Voice Note (PTT) cuy. Coba lagi deh!');
    }
};

handler.help = ['tovn', 'toptt'];
handler.tags = ['tools'];
handler.command = /^(tovn|toptt)$/i;

handler.limit = true; 

export default handler;