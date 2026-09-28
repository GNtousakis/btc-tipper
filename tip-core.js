/*
 * Shared core for the Bitcoin Tip Widget Generator.
 * Used by index.html (browser) and generate.js (Node CLI).
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.TipCore = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // Pinned, maintained QR library (qrcode-generator, MIT) with Subresource Integrity.
    // The hash is sha384 of dist/qrcode.js from the npm package; update both together.
    var QR_LIB_URL = 'https://cdn.jsdelivr.net/npm/qrcode-generator@2.0.4/dist/qrcode.js';
    var QR_LIB_SRI = 'sha384-e9EFD6BGC90bkW9aDV5xbbBfzwN7G8YImHao2lfLVKV/hPB0E0go+H3I64h7oHtA';
    var BADGE_STYLES = ['for-the-badge', 'flat', 'flat-square', 'plastic'];
    var TYPES = ['onchain', 'lightning'];

    var ONCHAIN_LEGACY = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    var ONCHAIN_BECH32 = /^bc1[ac-hj-np-z02-9]{11,87}$/;
    var LN_ADDRESS = /^[a-z0-9._+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i;
    var LNURL = /^lnurl1[ac-hj-np-z02-9]{20,}$/i;
    var LN_INVOICE = /^ln(?:bc|tbs|tb|bcrt)[0-9a-z]{50,}$/i;

    function isValidAddress(address, type) {
        if (typeof address !== 'string') return false;
        if (type === 'lightning') {
            return LN_ADDRESS.test(address) || LNURL.test(address) || LN_INVOICE.test(address);
        }
        if (ONCHAIN_LEGACY.test(address)) return true;
        // Bech32 must be entirely lower- or upper-case.
        if (address === address.toLowerCase() || address === address.toUpperCase()) {
            return ONCHAIN_BECH32.test(address.toLowerCase());
        }
        return false;
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // JSON string literal that is also safe inside an inline <script> block.
    function jsString(str) {
        return JSON.stringify(String(str))
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026')
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029');
    }

    function assertInputs(address, type) {
        if (TYPES.indexOf(type) === -1) {
            throw new Error('Unknown type "' + type + '". Use one of: ' + TYPES.join(', '));
        }
        if (!isValidAddress(address, type)) {
            throw new Error('Invalid ' + (type === 'lightning' ? 'Lightning' : 'Bitcoin') + ' address.');
        }
    }

    function randomId() {
        var s = '';
        while (s.length < 8) s += Math.random().toString(36).slice(2);
        return s.slice(0, 8);
    }

    function theme(isLightning) {
        return isLightning ? {
            primary: '#792EE5',
            gradient: '#792EE5, #9d4edd',
            shadow: 'rgba(121, 46, 229, 0.3)',
            shadowHover: 'rgba(121, 46, 229, 0.4)',
            buttonText: 'Tip via Lightning',
            title: 'Lightning Tip',
            subtitle: 'Scan to send via Lightning',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>'
        } : {
            primary: '#F7931A',
            gradient: '#F7931A, #e08316',
            shadow: 'rgba(247, 147, 26, 0.3)',
            shadowHover: 'rgba(247, 147, 26, 0.4)',
            buttonText: 'Tip Me in Bitcoin',
            title: 'Support my work',
            subtitle: 'Scan to send Bitcoin',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m13 2-2 2.5h3L12 7"/><path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727"/></svg>'
        };
    }

    /**
     * Returns the embeddable HTML/CSS/JS snippet. Everything is scoped to a
     * unique root id and wrapped in an IIFE, so several widgets (or the
     * generator preview) can live on one page without colliding.
     * options.qrSize: QR code size in px (default 160).
     */
    function generateWidgetCode(address, type, options) {
        assertInputs(address, type);
        options = options || {};
        var qrSize = Math.min(Math.max(parseInt(options.qrSize, 10) || 160, 80), 400);

        var isLightning = type === 'lightning';
        var protocol = isLightning ? 'lightning' : 'bitcoin';
        var t = theme(isLightning);
        var id = 'btc-tip-' + (options.id || randomId());
        var s = '#' + id;
        var font = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

        return '<!-- Tip Widget -->\n' +
'<div id="' + id + '">\n' +
'<style>\n' +
'  ' + s + ' .btc-tip-btn {\n' +
'    background: linear-gradient(135deg, ' + t.gradient + ');\n' +
'    color: white;\n' +
'    padding: 12px 24px;\n' +
'    border-radius: 12px;\n' +
'    font-weight: 600;\n' +
'    font-size: 16px;\n' +
'    cursor: pointer;\n' +
'    border: none;\n' +
'    display: inline-flex;\n' +
'    align-items: center;\n' +
'    gap: 10px;\n' +
'    font-family: ' + font + ';\n' +
'    transition: transform 0.2s, box-shadow 0.2s;\n' +
'    box-shadow: 0 4px 12px ' + t.shadow + ';\n' +
'  }\n' +
'  ' + s + ' .btc-tip-btn:hover,\n' +
'  ' + s + ' .btc-tip-btn:focus-visible {\n' +
'    transform: translateY(-2px);\n' +
'    box-shadow: 0 6px 16px ' + t.shadowHover + ';\n' +
'  }\n' +
'  ' + s + ' .btc-modal-overlay {\n' +
'    display: none;\n' +
'    position: fixed;\n' +
'    top: 0; left: 0;\n' +
'    width: 100%; height: 100%;\n' +
'    background: rgba(0,0,0,0.75);\n' +
'    backdrop-filter: blur(8px);\n' +
'    -webkit-backdrop-filter: blur(8px);\n' +
'    z-index: 999999;\n' +
'    justify-content: center;\n' +
'    align-items: center;\n' +
'    opacity: 0;\n' +
'    transition: opacity 0.3s ease;\n' +
'  }\n' +
'  ' + s + ' .btc-modal-overlay.show {\n' +
'    opacity: 1;\n' +
'  }\n' +
'  ' + s + ' .btc-modal {\n' +
'    background: #1e293b;\n' +
'    color: #f8fafc;\n' +
'    padding: 32px 24px;\n' +
'    border-radius: 20px;\n' +
'    text-align: center;\n' +
'    font-family: ' + font + ';\n' +
'    width: 90%;\n' +
'    max-width: 360px;\n' +
'    position: relative;\n' +
'    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);\n' +
'    border: 1px solid #334155;\n' +
'    transform: translateY(20px);\n' +
'    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);\n' +
'  }\n' +
'  ' + s + ' .btc-modal-overlay.show .btc-modal {\n' +
'    transform: translateY(0);\n' +
'  }\n' +
'  ' + s + ' .btc-close {\n' +
'    position: absolute;\n' +
'    top: 12px; right: 16px;\n' +
'    cursor: pointer;\n' +
'    font-size: 28px;\n' +
'    line-height: 1;\n' +
'    color: #94a3b8;\n' +
'    background: none;\n' +
'    border: none;\n' +
'    padding: 4px 8px;\n' +
'    transition: color 0.2s;\n' +
'  }\n' +
'  ' + s + ' .btc-close:hover {\n' +
'    color: #f8fafc;\n' +
'  }\n' +
'  ' + s + ' .btc-modal h3 {\n' +
'    margin: 0 0 8px 0;\n' +
'    font-size: 1.5rem;\n' +
'    color: ' + t.primary + ';\n' +
'  }\n' +
'  ' + s + ' .btc-modal p {\n' +
'    color: #94a3b8;\n' +
'    margin: 0 0 20px 0;\n' +
'    font-size: 0.95rem;\n' +
'  }\n' +
'  ' + s + ' .btc-address-box {\n' +
'    background: #0f172a;\n' +
'    padding: 14px;\n' +
'    border-radius: 10px;\n' +
'    font-size: 13px;\n' +
'    margin: 20px 0;\n' +
'    word-break: break-all;\n' +
'    border: 1px solid #334155;\n' +
'    color: #e2e8f0;\n' +
'    font-family: monospace;\n' +
'  }\n' +
'  ' + s + ' .btc-copy-btn {\n' +
'    background: #334155;\n' +
'    color: white;\n' +
'    border: none;\n' +
'    padding: 12px 20px;\n' +
'    border-radius: 10px;\n' +
'    font-weight: 600;\n' +
'    cursor: pointer;\n' +
'    transition: background 0.2s;\n' +
'    width: 100%;\n' +
'    font-size: 15px;\n' +
'  }\n' +
'  ' + s + ' .btc-copy-btn:hover {\n' +
'    background: #475569;\n' +
'  }\n' +
'  ' + s + ' .btc-qr {\n' +
'    background: white;\n' +
'    padding: 16px;\n' +
'    border-radius: 12px;\n' +
'    display: inline-block;\n' +
'    margin: 0 auto;\n' +
'    min-width: ' + qrSize + 'px;\n' +
'    min-height: ' + qrSize + 'px;\n' +
'  }\n' +
'</style>\n' +
'\n' +
'<button type="button" class="btc-tip-btn" data-open>\n' +
'  ' + t.icon + '\n' +
'  ' + t.buttonText + '\n' +
'</button>\n' +
'\n' +
'<div class="btc-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="' + id + '-title" data-overlay>\n' +
'  <div class="btc-modal">\n' +
'    <button type="button" class="btc-close" aria-label="Close" data-close>&times;</button>\n' +
'    <h3 id="' + id + '-title">' + t.title + '</h3>\n' +
'    <p>' + t.subtitle + '</p>\n' +
'    <div class="btc-qr" data-qr></div>\n' +
'    <div class="btc-address-box">' + escapeHtml(address) + '</div>\n' +
'    <button type="button" class="btc-copy-btn" data-copy>Copy Address</button>\n' +
'  </div>\n' +
'</div>\n' +
'\n' +
'<script>\n' +
'(function () {\n' +
'  var root = document.getElementById(' + jsString(id) + ');\n' +
'  if (!root) return;\n' +
'  var ADDRESS = ' + jsString(address) + ';\n' +
'  var URI = ' + jsString(protocol + ':' + address) + ';\n' +
'  var QR_URL = ' + jsString(QR_LIB_URL) + ';\n' +
'  var QR_SRI = ' + jsString(QR_LIB_SRI) + ';\n' +
'  var overlay = root.querySelector("[data-overlay]");\n' +
'  var openBtn = root.querySelector("[data-open]");\n' +
'  var closeBtn = root.querySelector("[data-close]");\n' +
'  var copyBtn = root.querySelector("[data-copy]");\n' +
'  var qrBox = root.querySelector("[data-qr]");\n' +
'  var qrDone = false;\n' +
'\n' +
'  function loadQr(cb) {\n' +
'    if (window.qrcode) return cb();\n' +
'    var s = window.__btcQrScript;\n' +
'    if (!s) {\n' +
'      s = window.__btcQrScript = document.createElement("script");\n' +
'      s.src = QR_URL;\n' +
'      s.integrity = QR_SRI;\n' +
'      s.crossOrigin = "anonymous";\n' +
'      s.async = true;\n' +
'      document.head.appendChild(s);\n' +
'    }\n' +
'    s.addEventListener("load", cb);\n' +
'    s.addEventListener("error", function () {\n' +
'      qrBox.textContent = "QR code unavailable - copy the address below.";\n' +
'      qrBox.style.fontSize = "13px";\n' +
'      qrBox.style.color = "#334155";\n' +
'    });\n' +
'  }\n' +
'\n' +
'  function drawQr() {\n' +
'    if (qrDone || !window.qrcode) return;\n' +
'    var qr = window.qrcode(0, "M");\n' +
'    qr.addData(URI);\n' +
'    qr.make();\n' +
'    qrBox.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true, alt: "QR code for " + URI });\n' +
'    var svg = qrBox.firstChild;\n' +
'    svg.setAttribute("width", "' + qrSize + '");\n' +
'    svg.setAttribute("height", "' + qrSize + '");\n' +
'    svg.style.display = "block";\n' +
'    qrDone = true;\n' +
'  }\n' +
'\n' +
'  function onKey(e) {\n' +
'    if (e.key === "Escape") close();\n' +
'  }\n' +
'\n' +
'  function open() {\n' +
'    overlay.style.display = "flex";\n' +
'    // Let display:flex apply first so the opacity transition runs.\n' +
'    setTimeout(function () { overlay.classList.add("show"); }, 10);\n' +
'    document.addEventListener("keydown", onKey);\n' +
'    closeBtn.focus();\n' +
'    loadQr(drawQr);\n' +
'  }\n' +
'\n' +
'  function close() {\n' +
'    overlay.classList.remove("show");\n' +
'    document.removeEventListener("keydown", onKey);\n' +
'    setTimeout(function () { overlay.style.display = "none"; }, 300);\n' +
'    openBtn.focus();\n' +
'  }\n' +
'\n' +
'  function fallbackCopy() {\n' +
'    var ta = document.createElement("textarea");\n' +
'    ta.value = ADDRESS;\n' +
'    ta.style.position = "fixed";\n' +
'    ta.style.opacity = "0";\n' +
'    document.body.appendChild(ta);\n' +
'    ta.select();\n' +
'    var ok = false;\n' +
'    try { ok = document.execCommand("copy"); } catch (e) {}\n' +
'    document.body.removeChild(ta);\n' +
'    return ok;\n' +
'  }\n' +
'\n' +
'  function flash(ok) {\n' +
'    var original = "Copy Address";\n' +
'    copyBtn.textContent = ok ? "Copied!" : "Press Ctrl+C to copy";\n' +
'    copyBtn.style.background = ok ? "#10b981" : "#ef4444";\n' +
'    setTimeout(function () {\n' +
'      copyBtn.textContent = original;\n' +
'      copyBtn.style.background = "";\n' +
'    }, 2000);\n' +
'  }\n' +
'\n' +
'  function copy() {\n' +
'    if (navigator.clipboard && navigator.clipboard.writeText) {\n' +
'      navigator.clipboard.writeText(ADDRESS).then(function () { flash(true); }, function () { flash(fallbackCopy()); });\n' +
'    } else {\n' +
'      flash(fallbackCopy());\n' +
'    }\n' +
'  }\n' +
'\n' +
'  openBtn.addEventListener("click", open);\n' +
'  closeBtn.addEventListener("click", close);\n' +
'  copyBtn.addEventListener("click", copy);\n' +
'  overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });\n' +
'})();\n' +
'<\/script>\n' +
'</div>\n' +
'<!-- End Tip Widget -->';
    }

    /**
     * Markdown badge. GitHub strips raw bitcoin:/lightning: links, so the badge
     * links to a quickchart.io QR image of the payment URI.
     */
    function generateBadge(address, type, style) {
        assertInputs(address, type);
        style = style || 'for-the-badge';
        if (BADGE_STYLES.indexOf(style) === -1) {
            throw new Error('Unknown badge style "' + style + '". Use one of: ' + BADGE_STYLES.join(', '));
        }
        var isLightning = type === 'lightning';
        var protocol = isLightning ? 'lightning' : 'bitcoin';
        var label = isLightning ? 'Tip_Me-Lightning' : 'Tip_Me-Bitcoin';
        var color = isLightning ? '792EE5' : 'F7931A';
        var logo = isLightning ? 'lightning' : 'bitcoin';

        var badgeUrl = 'https://img.shields.io/badge/' + label + '-' + color +
            '?style=' + style + '&logo=' + logo + '&logoColor=white';
        var qrUrl = 'https://quickchart.io/qr?size=500&text=' +
            encodeURIComponent(protocol + ':' + address).replace(/[()]/g, function (c) {
                return c === '(' ? '%28' : '%29';
            });
        return {
            badgeUrl: badgeUrl,
            qrUrl: qrUrl,
            markdown: '[![Tip Me](' + badgeUrl + ')](' + qrUrl + ')'
        };
    }

    return {
        BADGE_STYLES: BADGE_STYLES,
        TYPES: TYPES,
        isValidAddress: isValidAddress,
        escapeHtml: escapeHtml,
        jsString: jsString,
        generateWidgetCode: generateWidgetCode,
        generateBadge: generateBadge
    };
}));
