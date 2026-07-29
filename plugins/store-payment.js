/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * 📞 WhatsApp  : +62 882-5804-1396
 * 📢 Channel   : https://whatsapp.com/channel/0029VbAnuii6GcGCu73oep1i
 * ⚠️ Note      : Keep credit to respect the creator!
 * ─────────────────────────
 * 📝 Plugin : Nevapedia Payment Gateway
 * ⚡ UI BY : Li Shiya MD
**/

import axios from 'axios'

const API_KEY = 'apikeymu sendiri'
const BASE_URL = 'https://app.nevapedia.com/api'

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    let action = args[0]?.toLowerCase()
    let amount = ''

    if (action && !isNaN(action)) {
        amount = action
        action = 'invoice'
    }

    const showMenu = () => {
        let txt = `╭── ⋆ ✧ ꒰ 🎀 *NEVAPEDIA API* 🎀 ꒱ ✧ ⋆ ──\n`
        txt += `┊ 🌸 *Daftar Perintah:*\n`
        txt += `┊ ➭ *${usedPrefix + command} <nominal>* (Buat Invoice)\n`
        txt += `┊ ➭ *${usedPrefix + command} cekinvoice <id_invoice>*\n`
        
        if (isOwner) {
            txt += `┊ ➭ *${usedPrefix + command} balance* (Cek Saldo)\n`
            txt += `┊ ➭ *${usedPrefix + command} wdmethod* (List Metode WD)\n`
            txt += `┊ ➭ *${usedPrefix + command} wd <nom> <metode> <no_rek> [instant(true/false)]*\n`
            txt += `┊ ➭ *${usedPrefix + command} cekwd <id_wd>*\n`
        }
        
        txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Payment Gateway* 🌸`
        return m.reply(txt)
    }

    if (!action) return showMenu()

    await m.react('⏳')

    try {
        switch (action) {
            case 'balance':
            case 'saldo': {
                if (!isOwner) return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *AKSES DITOLAK* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Fitur ini khusus Owner bot!\n╰────────────────────── ⋆ ✧`)
                
                let res = await axios.get(`${BASE_URL}/balance?apikey=${API_KEY}`)
                let data = res.data
                let txt = `╭── ⋆ ✧ ꒰ 🎀 *NEVAPEDIA BALANCE* 🎀 ꒱ ✧ ⋆ ──\n`
                txt += `┊ 👤 *Username:* ${data.username || '-'}\n`
                txt += `┊ 📧 *Email:* ${data.email || '-'}\n`
                txt += `┊ 💰 *Saldo:* Rp ${data.balance ? data.balance.toLocaleString('id-ID') : '0'}\n`
                txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Payment Gateway* 🌸`
                await m.reply(txt)
                break
            }

            case 'invoice':
            case 'create': {
                let nominal = amount || args[1]
                if (!nominal || isNaN(nominal)) return m.reply(`⚠️ Masukkan nominal yang valid!\nContoh: *${usedPrefix + command} 50000*`)
                
                let res = await axios.get(`${BASE_URL}/invoice?apikey=${API_KEY}&amount=${nominal}`)
                let data = res.data

                if (!data.success && !data.invoice_id) throw new Error(data.message || 'Gagal membuat invoice')

                let txt = `╭── ⋆ ✧ ꒰ 🎀 *INVOICE CREATED* 🎀 ꒱ ✧ ⋆ ──\n`
                txt += `┊ 🆔 *ID Invoice:* ${data.invoice_id}\n`
                txt += `┊ 💰 *Nominal:* Rp ${data.amount.toLocaleString('id-ID')}\n`
                txt += `┊ 📉 *Fee:* Rp ${data.fee.toLocaleString('id-ID')}\n`
                txt += `┊ 💵 *Total Bayar:* Rp ${data.total.toLocaleString('id-ID')}\n`
                txt += `┊ ⏳ *Expired:* ${data.expired_at}\n`
                txt += `┊ 🔗 *Link Bayar:* ${data.payment_link || '-'}\n`
                txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Payment Gateway* 🌸`

                if (data.qris_image) {
                    await conn.sendMessage(m.chat, { image: { url: data.qris_image }, caption: txt }, { quoted: m })
                } else {
                    await m.reply(txt)
                }
                break
            }

            case 'cekinvoice':
            case 'statusinv': {
                let invId = args[1]
                if (!invId) return m.reply(`⚠️ Masukkan ID Invoice!\nContoh: *${usedPrefix + command} cekinvoice 64c8d9e...*`)
                
                let res = await axios.get(`${BASE_URL}/invoice/status?apikey=${API_KEY}&invoice_id=${invId}`)
                let data = res.data

                let txt = `╭── ⋆ ✧ ꒰ 🎀 *CEK INVOICE* 🎀 ꒱ ✧ ⋆ ──\n`
                txt += `┊ 🆔 *ID Invoice:* ${data.invoice_id}\n`
                txt += `┊ 📊 *Status:* ${data.status.toUpperCase()}\n`
                txt += `┊ 💰 *Nominal:* Rp ${data.amount.toLocaleString('id-ID')}\n`
                txt += `┊ 💵 *Total Bayar:* Rp ${data.total.toLocaleString('id-ID')}\n`
                txt += `┊ 📅 *Dibuat:* ${data.created_at}\n`
                txt += `┊ ⏳ *Expired:* ${data.expired_at}\n`
                txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Payment Gateway* 🌸`
                await m.reply(txt)
                break
            }

            case 'wdmethod':
            case 'method': {
                if (!isOwner) return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *AKSES DITOLAK* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Fitur ini khusus Owner bot!\n╰────────────────────── ⋆ ✧`)
                
                let res = await axios.get(`${BASE_URL}/withdraw/methods?apikey=${API_KEY}`)
                let data = res.data

                let txt = `╭── ⋆ ✧ ꒰ 🎀 *METODE WITHDRAW* 🎀 ꒱ ✧ ⋆ ──\n`
                txt += `┊ 📌 *Manual Methods:*\n`
                if (data.manual_methods && data.manual_methods.length > 0) {
                    data.manual_methods.forEach(m => {
                        txt += `┊ ◦ ${m.name} (${m.code}) - Fee: Rp${m.fee}\n`
                    })
                } else {
                    txt += `┊ ◦ (Tidak tersedia)\n`
                }

                txt += `┊ \n┊ ⚡ *Instant Methods:*\n`
                if (data.instant_methods && data.instant_methods.length > 0) {
                    data.instant_methods.forEach(m => {
                        txt += `┊ ◦ ${m.name} (${m.code}) - Fee: Rp${m.fee}\n`
                    })
                } else {
                    txt += `┊ ◦ (Tidak tersedia)\n`
                }
                txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Payment Gateway* 🌸`
                
                await m.reply(txt)
                break
            }

            case 'wd':
            case 'withdraw': {
                if (!isOwner) return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *AKSES DITOLAK* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Fitur ini khusus Owner bot!\n╰────────────────────── ⋆ ✧`)
                
                let wdAmount = args[1]
                let method = args[2]
                let accNum = args[3]
                let instant = args[4] ? args[4].toLowerCase() : 'false'

                if (!wdAmount || !method || !accNum) {
                    return m.reply(`⚠️ Format salah!\nContoh: *${usedPrefix + command} wd 50000 dana 08123456789 false*`)
                }

                let isInstant = (instant === 'true' || instant === 'instan') ? 'true' : 'false'
                let res = await axios.get(`${BASE_URL}/withdraw?apikey=${API_KEY}&amount=${wdAmount}&method=${method}&account_number=${accNum}&instant=${isInstant}`)
                let data = res.data

                if (!data.success) throw new Error(data.message || 'Penarikan gagal.')

                let wd = data.data
                let txt = `╭── ⋆ ✧ ꒰ 🎀 *WITHDRAWAL* 🎀 ꒱ ✧ ⋆ ──\n`
                txt += `┊ 🆔 *ID WD:* ${wd.id}\n`
                txt += `┊ 🏦 *Metode:* ${wd.method}\n`
                txt += `┊ 🔢 *No Akun:* ${wd.account_number}\n`
                txt += `┊ 💰 *Nominal:* Rp ${wd.amount.toLocaleString('id-ID')}\n`
                txt += `┊ 📉 *Fee:* Rp ${wd.fee.toLocaleString('id-ID')}\n`
                txt += `┊ 📊 *Status:* ${wd.status.toUpperCase()}\n`
                txt += `┊ 📅 *Waktu:* ${wd.created_at}\n`
                txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Payment Gateway* 🌸`
                await m.reply(txt)
                break
            }

            case 'cekwd':
            case 'statuswd': {
                if (!isOwner) return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *AKSES DITOLAK* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Fitur ini khusus Owner bot!\n╰────────────────────── ⋆ ✧`)
                
                let wdId = args[1]
                if (!wdId) return m.reply(`⚠️ Masukkan ID Withdraw!\nContoh: *${usedPrefix + command} cekwd WDc4e3f2...*`)
                
                let res = await axios.get(`${BASE_URL}/withdraw/status?apikey=${API_KEY}&id=${wdId}`)
                let data = res.data

                let txt = `╭── ⋆ ✧ ꒰ 🎀 *CEK WITHDRAW* 🎀 ꒱ ✧ ⋆ ──\n`
                txt += `┊ 🆔 *ID WD:* ${data.id}\n`
                txt += `┊ 🏦 *Metode:* ${data.method} (${data.account_number})\n`
                txt += `┊ 💰 *Nominal:* Rp ${data.amount.toLocaleString('id-ID')}\n`
                txt += `┊ 📊 *Status:* ${data.status.toUpperCase()}\n`
                txt += `┊ ⚡ *Instan:* ${data.instant ? 'Ya' : 'Tidak'}\n`
                txt += `┊ 📅 *Dibuat:* ${data.created_at || '-'}\n`
                txt += `┊ ✅ *Selesai:* ${data.completed_at || '-'}\n`
                txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Payment Gateway* 🌸`
                await m.reply(txt)
                break
            }

            default:
                showMenu()
        }

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        
        let errorMsg = e.message
        if (e.response && e.response.data) {
            errorMsg = e.response.data.message || e.response.data.error || JSON.stringify(e.response.data)
        }
        
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengeksekusi perintah.\n┊ _${errorMsg}_\n╰────────────────────── ⋆ ✧`)
    }
}

handler.help = ['payment <nominal>', 'payment <opsi>']
handler.tags = ['store']
handler.command = /^pay|payment$/i

export default handler