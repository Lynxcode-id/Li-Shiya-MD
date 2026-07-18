import stripAnsi from 'strip-ansi'; 

const maxBytes = 500 * 1024;
const maxLineLength = 2000;

let totalBytes = 0;
const stdouts = [];

export let isModified = false;

export default () => {
  if (isModified) return { disable: () => {} };

  const oldStdoutWrite = process.stdout.write.bind(process.stdout);
  const oldStderrWrite = process.stderr.write.bind(process.stderr);

  const disable = () => {
    process.stdout.write = oldStdoutWrite;
    process.stderr.write = oldStderrWrite;
    isModified = false;
  };

  const captureWrite = (oldWrite) => (chunk, encoding, callback) => {
    const actualEncoding = typeof encoding === 'string' ? encoding : 'utf8';
    let text = Buffer.isBuffer(chunk) ? chunk.toString(actualEncoding) : String(chunk);

    text = stripAnsi(text);

    if (text.length > maxLineLength || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text)) {
      return oldWrite(chunk, encoding, callback);
    }

    const byteLength = Buffer.byteLength(text);
    stdouts.push({ byteLength, text });
    totalBytes += byteLength;

    while (totalBytes > maxBytes && stdouts.length > 0) {
      totalBytes -= stdouts.shift().byteLength;
    }

    return oldWrite(chunk, encoding, callback);
  };

  process.stdout.write = captureWrite(oldStdoutWrite);
  process.stderr.write = captureWrite(oldStderrWrite);

  isModified = true;
  return { disable };
};

export const logs = (limit = 50) => {
  if (stdouts.length === 0) return 'No logs captured.';
  const lines = stdouts.slice(-limit).map(o => o.text);
  return lines.join('');
};

export const clearLogs = () => {
  stdouts.length = 0;
  totalBytes = 0;
};
