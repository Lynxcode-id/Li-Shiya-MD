import { AIRich } from '../lib/nixcode.js';

let handler = m => m

handler.before = async function (m, { conn }) {
  const DB = this.db || global.db
  let user = DB.data.users[m.sender]
  
  if (!user) return true
  const clockString = (ms) => {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m_time = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m_time, s].map(v => v.toString().padStart(2, 0)).join(':')
  }
  
  if (user.afk > -1) {
    let timeAFK = clockString(new Date - user.afk)
    let reason = user.afkReason
    user.afk = -1
    user.afkReason = ''
    
    let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://files.catbox.moe/vsliak.jpg')

    try {
        await new AIRich(conn)
            .addProduct({
                title: 'System Notification', 
                brand: 'Li-Shiya AI', 
                price: 'Status', 
                sale_price: 'Online', 
                product_url: `https://wa.me/${m.sender.split('@')[0]}`, 
                icon_url: pp, 
                image_url: pp
            })
            .addText(`🌤️ *A F K  B E R H E N T I*\n\nKamu telah kembali dari AFK.\n⏱️ *Lama:* ${timeAFK}\n${reason ? `🍀 *Alasan:* ${reason}` : ''}`)
            .send(m.chat, { quoted: m });
    } catch(e) {
        console.error(e);
        m.reply(`Kamu berhenti AFK${reason ? ' setelah ' + reason : ''}\nSelama ${timeAFK}`);
    }
  }
  
  let jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
  for (let jid of jids) {
    let taggedUser = DB.data.users[jid]
    if (!taggedUser) continue
    
    let afkTime = taggedUser.afk
    if (!afkTime || afkTime < 0) continue
    
    let reason = taggedUser.afkReason || 'Tanpa alasan'
    let timeAFK = clockString(new Date - afkTime)
    let pp = await conn.profilePictureUrl(jid, 'image').catch(_ => 'https://files.catbox.moe/vsliak.jpg')
    let userName = conn.getName(jid) || 'Pengguna'

    try {
         await new AIRich(conn)
            .addProduct({
                title: 'System Warning', 
                brand: 'Li-Shiya AI', 
                price: 'Status', 
                sale_price: 'AFK', 
                product_url: `https://wa.me/${jid.split('@')[0]}`, 
                icon_url: pp, 
                image_url: pp
            })
            .addText(`⚠️ *J A N G A N  D I T A G*\n\n*${userName}* sedang AFK!\n🍀 *Alasan:* ${reason}\n⏱️ *Lama:* ${timeAFK}`)
            .send(m.chat, { quoted: m });
    } catch(e) {
         console.error(e);
         m.reply(`Jangan tag dia!\nDia sedang AFK dengan alasan: ${reason}\nSelama ${timeAFK}`);
    }
  }
  return true
}

export default handler