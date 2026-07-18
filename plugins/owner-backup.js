import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { ZipArchive } = require('archiver');

let handler = async (m, { conn }) => {
    m.reply('Tunggu bentar ya cuy, lagi proses nge-zip file li-shiya... ⏳');

    const backupName = 'backup_li-shiya.zip';
    const output = fs.createWriteStream(backupName);
    const archive = new ZipArchive({
        zlib: { level: 9 }
    });

    try {
        await new Promise((resolve, reject) => {
            output.on('close', resolve);
            archive.on('error', reject);

            archive.pipe(output);
            archive.glob('**/*', {
                cwd: process.cwd(),
                ignore: [
                    'node_modules/**', 
                    '.npm/**', 
                    'package-lock.json', 
                    backupName
                ]
            });

            archive.finalize();
        });

        let targetNumber = global.ownerbackup || global.pairingNumber;
        
        if (!targetNumber) {
            throw new Error("Nomor tujuan backup belum di-setting di config (global.ownerbackup / global.pairingNumber)!");
        }

        let cleanNumber = targetNumber.toString().replace(/[^0-9]/g, '');
        const ownerJid = `${cleanNumber}@s.whatsapp.net`;
        
        await conn.sendMessage(ownerJid, {
            document: fs.readFileSync(backupName),
            mimetype: 'application/zip',
            fileName: backupName,
            caption: '╭── ⋆ ✧ ꒰ 🎀 *BACKUP SYSTEM* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Ini sayang, backup file li-shiya udah kelar.\n╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Security Tools* 🌸'
        }, { quoted: m });

        fs.unlinkSync(backupName);
        m.reply('Backup sukses dibuat dan sudah dikirim ke chat Tuan! ✨');

    } catch (err) {
        console.error(err);
        if (fs.existsSync(backupName)) fs.unlinkSync(backupName);
        m.reply('Waduh, ada error pas nge-backup: ' + err.message);
    }
};

handler.help = ['backup'];
handler.tags = ['owner'];
handler.command = /^(backup)$/i;
handler.owner = true; 

export default handler;
