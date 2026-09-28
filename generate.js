#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const core = require('./tip-core');

const USAGE = 'Usage: node generate.js <address> [onchain|lightning] [' + core.BADGE_STYLES.join('|') +
    '] [--out <dir>] [--qr-size <px>] [--force]';

function fail(message) {
    console.error(`❌ Error: ${message}`);
    console.log(`👉 ${USAGE}`);
    process.exit(1);
}

// Split flags from positional arguments
const positional = [];
const flags = { out: '.', qrSize: undefined, force: false };
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out') flags.out = args[++i];
    else if (args[i] === '--qr-size') flags.qrSize = args[++i];
    else if (args[i] === '--force') flags.force = true;
    else if (args[i].startsWith('--')) fail(`Unknown option ${args[i]}`);
    else positional.push(args[i]);
}

const [address, type = 'onchain', badgeStyle = 'for-the-badge'] = positional;

if (!address) fail('Please provide an address.');
if (!core.TYPES.includes(type)) fail(`Unknown type "${type}".`);
if (!core.BADGE_STYLES.includes(badgeStyle)) fail(`Unknown badge style "${badgeStyle}".`);
if (!core.isValidAddress(address, type)) fail(`"${address}" is not a valid ${type} address.`);
if (flags.out === undefined) fail('--out needs a directory.');

const widgetCode = core.generateWidgetCode(address, type, { qrSize: flags.qrSize });
const markdownCode = core.generateBadge(address, type, badgeStyle).markdown;

fs.mkdirSync(flags.out, { recursive: true });
const targets = [
    [path.join(flags.out, 'widget.html'), widgetCode],
    [path.join(flags.out, 'badge.md'), markdownCode],
];

const existing = targets.filter(([file]) => fs.existsSync(file));
if (existing.length && !flags.force) {
    fail(`${existing.map(([f]) => f).join(', ')} already exist. Use --force to overwrite or --out <dir>.`);
}

console.log(`Generating snippets for ${type} address: ${address}...\n`);
for (const [file, content] of targets) {
    fs.writeFileSync(file, content);
    console.log(`✅ Generated ${file}`);
}
console.log('\nYou can now use these files directly!');
