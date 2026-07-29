import { AIRich } from '../lib/nixcode.js';

let handler = async (m, { conn, text }) => {
    let user = global.db.data.users[m.sender]
    user.afk = + new Date
    user.afkReason = text
    let userName = conn.getName(m.sender)
    let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://files.catbox.moe/vsliak.jpg')

    await m.react('💤');

    try {
        await new AIRich(conn)
            .addProduct({
                title: 'System Notification', 
                brand: 'Li-Shiya AI', 
                price: 'Status', 
                sale_price: 'AFK', 
                product_url: `https://wa.me/${m.sender.split('@')[0]}`, 
                icon_url: pp, 
                image_url: pp
            })
            .addText(`💤 *A F K  A K T I F*\n\n*${userName}* sedang AFK.\n🍀 *Alasan:* ${text ? text : 'Tanpa alasan'}\n\n_Ketik apapun untuk menonaktifkan._`)
            .send(m.chat, { quoted: m });
    } catch (e) {
        console.error(e);
        m.reply(`💤 *${userName}* sekarang AFK.\n🍀 Alasan: ${text ? text : 'Tanpa alasan'}`);
    }
}

handler.help = ['afk <alasan>']
handler.tags = ['main']
handler.command = /^afk$/i
handler.limit = true

export default handler