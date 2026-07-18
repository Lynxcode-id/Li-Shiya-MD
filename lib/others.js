import axios from 'axios';
import * as cheerio from 'cheerio';

const TIMEOUT = 10000;

function ranNumb(min, max = null) {
	if (max !== null) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	} else {
		return Math.floor(Math.random() * min) + 1;
	}
}

function padLead(num, size) {
	return String(num).padStart(size, '0');
}

function niceBytes(x) {
	const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	let l = 0, n = parseInt(x, 10) || 0;
	while (n >= 1024 && ++l) {
		n = n / 1024;
	}
	return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
}

function capitalizeFirstLetter(string) {
	if (!string) return '';
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function isNumber(number) {
	const n = parseInt(number);
	return typeof n === 'number' && !isNaN(n);
}

function runtime(seconds) {
	seconds = Number(seconds) || 0;
	const d = Math.floor(seconds / 86400);
	const h = Math.floor(seconds % 86400 / 3600);
	const m = Math.floor(seconds % 3600 / 60);
	const s = Math.floor(seconds % 60);
	const parts = [];
	if (d) parts.push(`${d} day${d > 1 ? 's' : ''}`);
	if (h) parts.push(`${h} hour${h > 1 ? 's' : ''}`);
	if (m) parts.push(`${m} minute${m > 1 ? 's' : ''}`);
	if (s || parts.length === 0) parts.push(`${s} second${s !== 1 ? 's' : ''}`);
	return parts.join(', ');
}

function runtimes(seconds) {
	seconds = Number(seconds) || 0;
	const d = Math.floor(seconds / 86400);
	const h = Math.floor(seconds % 86400 / 3600);
	const m = Math.floor(seconds % 3600 / 60);
	const s = Math.floor(seconds % 60);
	const dDisplay = d > 0 ? d + 'd ' : '';
	const hDisplay = String(h).padStart(2, '0') + ':';
	const mDisplay = String(m).padStart(2, '0') + ':';
	const sDisplay = String(s).padStart(2, '0');
	return dDisplay + hDisplay + mDisplay + sDisplay;
}

async function quotesAnime() {
	try {
		const page = ranNumb(1, 100);
		const { data } = await axios.get('https://otakotaku.com/quote/feed/' + page, { timeout: TIMEOUT });
		const $ = cheerio.load(data);
		const hasil = [];
		$('div.kotodama-list').each((i, h) => {
			hasil.push({
				link: $(h).find('a').attr('href'),
				gambar: $(h).find('img').attr('data-src'),
				karakter: $(h).find('div.char-name').text().trim(),
				anime: $(h).find('div.anime-title').text().trim(),
				episode: $(h).find('div.meta').text(),
				up_at: $(h).find('small.meta').text(),
				quotes: $(h).find('div.quote').text().trim()
			});
		});
		return hasil;
	} catch (e) {
		return [];
	}
}

async function getBuffer(url, options = {}) {
	try {
		const res = await axios({
			method: 'get',
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1,
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			},
			timeout: TIMEOUT,
			...options,
			responseType: 'arraybuffer'
		});
		return res.data;
	} catch (err) {
		throw new Error(`getBuffer failed: ${err.message}`);
	}
}

async function playstore(name) {
	try {
		const { data } = await axios.get('https://play.google.com/store/search?q=' + encodeURIComponent(name) + '&c=apps', { timeout: TIMEOUT });
		const $ = cheerio.load(data);
		const result = [];
		$('div.wXUyZd > a').each((i, b) => {
			const link = 'https://play.google.com' + $(b).attr('href');
			const name = $(b).find('div.b8cIId.ReQCgd.Q9MA7b > div').text().trim();
			const dev = $(b).find('div.b8cIId.ReQCgd.KoLSrc > div').text().trim();
			const link_dev = 'https://play.google.com' + $(b).find('div.b8cIId.ReQCgd.KoLSrc > a').attr('href');
			if (name && link) result.push({ name, link, developer: dev, link_dev });
		});
		return result;
	} catch (e) {
		return []; 
	}
}

async function linkwa(nama) {
	try {
		const { data } = await axios.get('http://ngarang.com/link-grup-wa/daftar-link-grup-wa.php?search=' + encodeURIComponent(nama) + '&searchby=name', { timeout: TIMEOUT });
		const $ = cheerio.load(data);
		const result = [];
		$('div.wa-chat-title-container').each((i, b) => {
			const link = $(b).find('a').attr('href')?.split('?')[0];
			const nama = $(b).find('div.wa-chat-title-text').text().split('. ')[1];
			if (nama && link) result.push({ nama, link });
		});
		return result;
	} catch (e) {
		return [];
	}
}

function pickRandom(list) {
	if (!Array.isArray(list) || list.length === 0) return null;
	return list[Math.floor(Math.random() * list.length)];
}

function generate(n) {
	if (n <= 0) return '';
	return String(Math.floor(Math.random() * 9) + 1) + Array(n - 1).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
}

const delay = time => new Promise(res => setTimeout(res, time));

const isUrl = (text) => {
	if (!text) return false;
	try {
		const url = new URL(text);
		return ['http:', 'https:'].includes(url.protocol);
	} catch {
		return false;
	}
};

const getRandom = (ext = '') => {
	return `${Math.floor(Math.random() * 10000)}${ext}`;
};

const readMore = String.fromCharCode(8206).repeat(4001);

const someincludes = (data, id) => Array.isArray(data) && data.some(el => id.includes(el));
const somematch = (data, id) => Array.isArray(data) && data.includes(id);

export {
	ranNumb,
	padLead,
	niceBytes,
	capitalizeFirstLetter,
	isNumber,
	runtime,
	runtimes,
	quotesAnime,
	getBuffer,
	playstore,
	linkwa,
	pickRandom,
	generate,
	delay,
	isUrl,
	getRandom,
	readMore,
	someincludes,
	somematch
}
