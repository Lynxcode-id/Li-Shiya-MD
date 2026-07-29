import os from 'os';
import fs from 'fs';

let handler = async (m) => {
    const start = Date.now();
    await m.react('⏳');

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercent = ((usedMem / totalMem) * 100).toFixed(1);
    const speed = Date.now() - start;

    let cap = `╭── ⋆ ✧ ꒰ 🎀 *SERVER INFO* 🎀 ꒱ ✧ ⋆ ──\n`;
    cap += `┊ 💻 *Host* : ${os.hostname()}\n`;
    cap += `┊ ⚙️ *Platform* : ${process.env.USER === 'root' ? 'VPS / Root' : 'Hosting / Panel'}\n`;
    cap += `┊ 🚀 *Speed* : ${speed} ms\n`;
    cap += `┊ ⏱️ *Uptime Bot* : ${toTime(process.uptime() * 1000)}\n`;
    cap += `┊ 🛑 *Uptime Server* : ${toTime(os.uptime() * 1000)}\n`;
    cap += `┊ 💾 *Memory* : ${formatSize(usedMem)} / ${formatSize(totalMem)} (${memPercent}%)\n`;
    cap += `┊ 🧠 *CPU* : ${os.cpus()[0].model.trim()}\n`;
    cap += `┊ 🏷️ *Release* : ${os.release()} (${os.type()})\n`;
    cap += `┊ 🟢 *Node.js* : ${process.version}\n`;
    cap += `┊ 🏠 *CWD* : ${process.cwd()}\n`;
    cap += `┊ 🗑️ *Temp Files* : ${fs.readdirSync(os.tmpdir()).length} Files\n`;
    cap += `╰────────────────────── ⋆ ✧\n`;
    cap += `> 🌸 *Li Shiya MD - System Management* 🌸`;

    await m.reply(cap);
    await m.react('✅');
};

handler.help = ['ping', 'speed', 'os'];
handler.tags = ['info'];
handler.command = /^(ping|speed|os)$/i;

export default handler;

function toTime(ms) {
    let d = Math.floor(ms / 86400000);
    let h = Math.floor((ms % 86400000) / 3600000);
    let m = Math.floor((ms % 3600000) / 60000);
    let s = Math.floor((ms % 60000) / 1000);

    return (d ? `${d}d ` : '') + (h ? `${h}h ` : '') + (m ? `${m}m ` : '') + (s ? `${s}s` : '');
}

function formatSize(size) {
    const multiplier = Math.pow(10, 1);
    return Math.round((size / (1024 * 1024)) * multiplier) / multiplier + ' MB';
}