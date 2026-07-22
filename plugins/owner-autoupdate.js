import axios from 'axios'
import fs from 'fs'
import path from 'path'

const OWNER = 'Lynxcode-id'
const REPO = 'Li-Shiya-MD'
const FOLDER = 'plugins'
const BRANCH = 'main'
const CHECK_INTERVAL = 60 * 60 * 1000

async function syncPlugins(conn, m = null) {
    try {
        if (m) await m.react('⏳')
        
        const apiRes = await axios.get(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FOLDER}?ref=${BRANCH}&t=${Date.now()}`)
        const remoteFiles = apiRes.data.filter(file => file.name.endsWith('.js'))

        let updatedCount = 0
        let newCount = 0
        const localPluginsPath = path.resolve('./plugins')
        
        if (!fs.existsSync(localPluginsPath)) {
            fs.mkdirSync(localPluginsPath, { recursive: true })
        }

        for (let file of remoteFiles) {
            const filePath = path.join(localPluginsPath, file.name)
            const isExists = fs.existsSync(filePath)
            const rawRes = await axios.get(file.download_url, { responseType: 'arraybuffer' })
            
            if (isExists) {
                const localContent = fs.readFileSync(filePath)
                if (!localContent.equals(rawRes.data)) {
                    fs.writeFileSync(filePath, rawRes.data)
                    updatedCount++
                }
            } else {
                fs.writeFileSync(filePath, rawRes.data)
                newCount++
            }
        }

        if (!m && updatedCount === 0 && newCount === 0) return

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *UPDATE SELESAI* 🎀 ꒱ ✧ ⋆ ──\n`
        caption += `┊ ✅ *Sinkronisasi berhasil!*\n`
        caption += `┊ ➕ *Plugin Baru:* ${newCount}\n`
        caption += `┊ 🔄 *Plugin Diperbarui:* ${updatedCount}\n`
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Auto Update* 🌸`

        if (m) {
            await m.reply(caption)
            await m.react('✅')
        } else {
            let ownerNum = global.owner[0] + '@s.whatsapp.net'
            if (conn) await conn.sendMessage(ownerNum, { text: caption })
        }
    } catch (err) {
        console.error('Auto Update Error:', err)
        if (m) {
            await m.react('❌')
            m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengupdate plugin.\n┊ *Detail:* _${err.response?.data?.message || err.message}_\n╰────────────────────── ⋆ ✧`)
        }
    }
}

let handler = async (m, { conn, usedPrefix, command, args }) => {
    let action = args[0]?.toLowerCase()

    if (command === 'autoupdate') {
        if (!action || !['on', 'off'].includes(action)) {
            return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *AUTO UPDATE* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 *Penggunaan:* ${usedPrefix + command} on/off\n╰────────────────────── ⋆ ✧`)
        }

        if (action === 'on') {
            if (global.autoUpdatePluginInterval) return m.reply('⚠️ Auto Update sudah aktif sebelumnya!')
            
            global.autoUpdatePluginInterval = setInterval(() => {
                syncPlugins(conn)
            }, CHECK_INTERVAL)
            
            m.reply('✅ Auto Update berhasil *diaktifkan*! (Mengecek Github setiap 1 Jam)')
        } else if (action === 'off') {
            if (!global.autoUpdatePluginInterval) return m.reply('⚠️ Auto Update memang sedang tidak aktif!')
            
            clearInterval(global.autoUpdatePluginInterval)
            delete global.autoUpdatePluginInterval
            
            m.reply('❌ Auto Update berhasil *dimatikan*!')
        }
    } else {
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *PLUGIN UPDATER* 🎀 ꒱ ✧ ⋆ ──\n┊ 🔄 Sedang mengambil data terbaru dari Github...\n╰────────────────────── ⋆ ✧`)
        await syncPlugins(conn, m)
    }
}

handler.help = ['updateplugin', 'autoupdate <on/off>']
handler.tags = ['owner']
handler.command = /^(updateplugin|updateplug|up|autoupdate)$/i
handler.owner = true

export default handler