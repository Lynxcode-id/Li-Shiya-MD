import { watchFile, unwatchFile } from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

global.pairingNumber = 628211297179; // no bot - untuk pairing !!
global.owner = [['6288258041396', 'Lynx decode', true]]; // no owner bot

global.namebot = 'ʟɪ-sʜɪʏᴀ ᴇsᴍ'; // nama bot 
global.author = 'Lynx decode'; // nama owner sesuaikan
global.thumbnail = 'https://raw.githubusercontent.com/Lynxcode-id/picture/main/1784468420522.jpeg' // url thumbnail untuk menu utama
global.thumbnail2 = 'https://raw.githubusercontent.com/Lynxcode-id/picture/main/1784512578790.jpeg' // url thumbnail untuk menu kedua
global.thumbvid = 'https://c.termai.cc/v142/WFdf.mp4' // url vidio untuk menu utama
global.source = 'https://whatsapp.com/channel/0029VbAnuii6GcGCu73oep1i/2976'; // linkgc, saluran atau apapun bebas..

global.wait = 'Tunggu sebentar sayang lagi di proses...'; // pesan ketika memporses..
global.eror = 'Terjadi Kesalahan nih...'; // pesan jika fitur error

global.pakasir = {
	slug: 'kilersbotz',
	apikey: 'bWDO2M8GcfruzXscdKNQJC3vw8Y8PV13',
	expired: 30,
};

// --[ AUDIO SETTINGS ]--
global.menuaudio = [
'https://files.catbox.moe/hrfi2l.mpeg' // ganti aja
]

global.menuaudio2 = [
    'https://files.claidexdigital.tokyo/audios/lgQJFHUK.mp3' // ganti aja
];


global.stickpack = 'Create By'; 
global.stickauth = namebot;

global.multiplier = 38;

// -- 𝙱𝙰𝚃𝙰𝚂 -- //
global.rpg = {
	emoticon(string) {
		string = string.toLowerCase();
		let emot = {
			level: '📊',
			limit: '🎫',
			health: '❤️',
			stamina: '🔋',
			exp: '✨',
			money: '💹',
			bank: '🏦',
			potion: '🥤',
			diamond: '💎',
			common: '📦',
			uncommon: '🛍️',
			mythic: '🎁',
			legendary: '🗃️',
			superior: '💼',
			pet: '🔖',
			trash: '🗑',
			armor: '🥼',
			sword: '⚔️',
			pickaxe: '⛏️',
			fishingrod: '🎣',
			wood: '🪵',
			rock: '🪨',
			string: '🕸️',
			horse: '🐴',
			cat: '🐱',
			dog: '🐶',
			fox: '🦊',
			petFood: '🍖',
			iron: '⛓️',
			gold: '🪙',
			emerald: '❇️',
			upgrader: '🧰',
		};
		let results = Object.keys(emot)
			.map((v) => [v, new RegExp(v, 'gi')])
			.filter((v) => v[1].test(string));
		if (!results.length) return '';
		else return emot[results[0][0]];
	},
};

// -- 𝚆𝙰𝚁𝙽𝙸𝙽𝙶 𝙰𝚁𝙴𝙰 𝙹𝙰𝙽𝙶𝙰𝙽 𝙳𝙸 𝙰𝙿𝙰 𝙰𝙿𝙰𝙺𝙰𝙽 -- // 
let file = fileURLToPath(import.meta.url);
watchFile(file, () => {
	unwatchFile(file);
	console.log(chalk.redBright("Update 'config.js'"));
	import(`${file}?update=${Date.now()}`);
});
