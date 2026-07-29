import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const archiver = require('archiver');
import path from 'path';

let handler = async (m, { conn }) => {
    m.reply('Tunggu bentar ya cuy, lagi proses nge-zip file... ⏳');

    const backupName = 'backup_li-shiya.zip';
    const output = fs.createWriteStream(backupName);
    const archive = new archiver.ZipArchive({
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
                    'core/**',
                    'assets/**',
                    'data/**',
                    'sessions/**',
                    'archive-2026-07-17T080244+0200.tar.gz',
                    backupName
                ]
            });

            archive.finalize();
        });

        const ownerJid = '6288258041396@s.whatsapp.net';
        
        await conn.sendMessage(ownerJid, {
            document: fs.readFileSync(backupName),
            mimetype: 'application/zip',
            fileName: backupName,
            caption: 'ini sayang backup file li-shiya udah kelar. 🚀'
        }, { quoted: m });

        fs.unlinkSync(backupName);
        m.reply('Backup sudah dikirim ke tuan ✨!');

    } catch (err) {
        console.error(err);
        m.reply('Waduh, ada error pas nge-backup: ' + err.message);
    }
};

handler.help = ['backup'];
handler.tags = ['owner'];
handler.command = /^(backup)$/i;
handler.owner = true; 

export default handler;