const test = require('node:test');
const assert = require('node:assert');
const vm = require('node:vm');
const core = require('../tip-core');

const BECH32 = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
const LEGACY = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';
const P2SH = '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy';
const LNURL = 'lnurl1dp68gurn8ghj7um9wfmxjcm99e3k7mf0v9cxj0m385ekvcenxc6r2c35xvukxefcv5mkvv34x5ekzd3ev56nyd3hxqurzepexejxxepnxscrvwfnv9nxzcn9xq6xyefhvgcxxcmyxymnserxfq5fns';

test('accepts valid on-chain addresses', () => {
    for (const a of [BECH32, BECH32.toUpperCase(), LEGACY, P2SH]) {
        assert.ok(core.isValidAddress(a, 'onchain'), a);
    }
});

test('rejects invalid / injected on-chain addresses', () => {
    for (const a of [
        '', 'hello', LEGACY + "');alert(1);//", 'x' + LEGACY, LEGACY + ' junk',
        BECH32 + '"', 'bc1QXY2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // mixed case
        '<script>3' + P2SH, 'bc1' + 'b'.repeat(30),
    ]) {
        assert.ok(!core.isValidAddress(a, 'onchain'), a);
    }
});

test('lightning validation', () => {
    assert.ok(core.isValidAddress('satoshi@getalby.com', 'lightning'));
    assert.ok(core.isValidAddress(LNURL, 'lightning'));
    assert.ok(core.isValidAddress('lntb1' + 'q'.repeat(60), 'lightning'));
    assert.ok(!core.isValidAddress('lnbc', 'lightning'));
    assert.ok(!core.isValidAddress("a'b@c.com", 'lightning'));
    assert.ok(!core.isValidAddress('a@b', 'lightning'));
});

test('widget refuses invalid input', () => {
    assert.throws(() => core.generateWidgetCode("x'); alert(1); //", 'onchain'));
    assert.throws(() => core.generateWidgetCode(BECH32, 'bogus'));
});

test('widget script is valid JS and embeds the address safely', () => {
    for (const [addr, type] of [[BECH32, 'onchain'], ['satoshi@getalby.com', 'lightning']]) {
        const html = core.generateWidgetCode(addr, type, { id: 'x' });
        const script = /<script>([\s\S]*?)<\/script>/.exec(html)[1];
        assert.doesNotThrow(() => new vm.Script(script));
        assert.ok(script.includes(JSON.stringify(addr)));
    }
});

test('widgets get unique ids and scoped CSS', () => {
    const a = core.generateWidgetCode(BECH32, 'onchain');
    const b = core.generateWidgetCode(BECH32, 'onchain');
    assert.notStrictEqual(a.match(/id="(btc-tip-\w+)"/)[1], b.match(/id="(btc-tip-\w+)"/)[1]);
    assert.ok(!/^\s*\.btc-tip-btn/m.test(a));
});

test('badge encodes the URI and validates the style', () => {
    const { markdown, qrUrl } = core.generateBadge('satoshi@getalby.com', 'lightning', 'flat');
    assert.ok(qrUrl.endsWith('text=lightning%3Asatoshi%40getalby.com'));
    assert.ok(markdown.startsWith('[![Tip Me](https://img.shields.io/badge/Tip_Me-Lightning-792EE5?style=flat'));
    assert.throws(() => core.generateBadge(BECH32, 'onchain', 'nope'));
});

test('escapeHtml / jsString', () => {
    assert.strictEqual(core.escapeHtml(`<a href="x">&'`), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;');
    assert.ok(!core.jsString('</script>').includes('<'));
});
