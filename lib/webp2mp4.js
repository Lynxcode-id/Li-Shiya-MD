import fetch from 'node-fetch';
import FormData from 'form-data';
import { JSDOM } from 'jsdom';

const fakeHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://ezgif.com',
    'Referer': 'https://ezgif.com/'
};

/**
 * Convert WebP to MP4 via Ezgif
 * @param {Buffer|String} source 
 */
async function webp2mp4(source) {
  try {
    let form = new FormData();
    let isUrl = typeof source === 'string' && /https?:\/\//.test(source);
    form.append('new-image-url', isUrl ? source : '');
    form.append('new-image', isUrl ? '' : source, 'image.webp');
    
    let res = await fetch('https://ezgif.com/webp-to-mp4', {
      method: 'POST',
      body: form,
      headers: fakeHeaders
    });
    
    let html = await res.text();
    let { document } = new JSDOM(html).window;
    
    let form2 = new FormData();
    let obj = {};
    for (let input of document.querySelectorAll('form input[name]')) {
      obj[input.name] = input.value;
      form2.append(input.name, input.value);
    }
    
    let res2 = await fetch('https://ezgif.com/webp-to-mp4/' + obj.file, {
      method: 'POST',
      body: form2,
      headers: fakeHeaders
    });
    
    let html2 = await res2.text();
    let { document: document2 } = new JSDOM(html2).window;
    let videoSource = document2.querySelector('div#output > p.outfile > video > source')?.src;
    
    if (!videoSource) {
      throw new Error('Gagal dapet link video dari Ezgif. Mungkin server melimit request atau file rusak.');
    }
    
    return new URL(videoSource, res2.url).toString();
  } catch (error) {
    console.error('[Webp2Mp4 Error]:', error);
    throw error;
  }
}

/**
 * Convert WebP to PNG via Ezgif
 * @param {Buffer|String} source 
 */
async function webp2png(source) {
  try {
    let form = new FormData();
    let isUrl = typeof source === 'string' && /https?:\/\//.test(source);
    form.append('new-image-url', isUrl ? source : '');
    form.append('new-image', isUrl ? '' : source, 'image.webp');
    
    let res = await fetch('https://ezgif.com/webp-to-png', {
      method: 'POST',
      body: form,
      headers: fakeHeaders
    });
    
    let html = await res.text();
    let { document } = new JSDOM(html).window;
    
    let form2 = new FormData();
    let obj = {};
    for (let input of document.querySelectorAll('form input[name]')) {
      obj[input.name] = input.value;
      form2.append(input.name, input.value);
    }
    
    let res2 = await fetch('https://ezgif.com/webp-to-png/' + obj.file, {
      method: 'POST',
      body: form2,
      headers: fakeHeaders
    });
    
    let html2 = await res2.text();
    let { document: document2 } = new JSDOM(html2).window;
    let imgSource = document2.querySelector('div#output > p.outfile > img')?.src;
    
    if (!imgSource) {
        throw new Error('Gagal dapet link gambar dari Ezgif. Mungkin server melimit request atau file rusak.');
    }

    return new URL(imgSource, res2.url).toString();
  } catch (error) {
    console.error('[Webp2Png Error]:', error);
    throw error;
  }
}

export {
  webp2mp4,
  webp2png
};
