import fs from 'fs';
import path from 'path';
import os from 'os';

const cleanTmp = () => {
    const dirs = [os.tmpdir(), path.join(process.cwd(), 'tmp')];
    
    for (const dir of dirs) {
        if (fs.existsSync(dir)) {
            fs.readdirSync(dir).forEach(file => {
                const filePath = path.join(dir, file);
                try {
                    if (fs.statSync(filePath).isFile()) {
                        fs.unlinkSync(filePath);
                    }
                } catch (e) {}
            });
        }
    }
};

if (!global.shiyaAutoClean) {
    global.shiyaAutoClean = setInterval(() => {
        cleanTmp();
        console.log('🎀 [Li Shiya System] Auto-clean folder tmp berhasil dijalankan!');
    }, 5 * 60 * 1000);
}

let handler = async (m, { conn }) => {
    await m.react('⏳');
    
    cleanTmp();
    
    let cap = `╭── ⋆ ✧ ꒰ 🎀 *AUTO CLEAN SYSTEM* 🎀 ꒱ ✧ ⋆ ──\n`;
    cap += `┊ ✅ Berhasil membersihkan semua file di folder Tmp!\n`;
    cap += `┊ ⏱️ Mode Auto-Clean: *Aktif* (setiap 5 menit).\n`;
    cap += `╰────────────────────── ⋆ ✧\n`;
    cap += `> 🌸 *Li Shiya MD - System Management* 🌸`;

    await m.reply(cap);
    await m.react('✅');
};

handler.help = ['cleartmp'];
handler.tags = ['owner'];
handler.command = /^(cleartmp)$/i;
handler.owner = true;

export default handler;