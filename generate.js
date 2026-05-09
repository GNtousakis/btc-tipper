#!/usr/bin/env node

const fs = require('fs');

// Get the Bitcoin address from the command line arguments
const address = process.argv[2];
const type = process.argv[3] || 'onchain'; // Default to onchain

if (!address) {
    console.error("❌ Error: Please provide an address.");
    console.log("👉 Usage: node generate.js <address> [onchain|lightning]");
    process.exit(1);
}

// Escape the address just in case
const safeAddr = address.replace(/</g, "&lt;").replace(/>/g, "&gt;");

const isLightning = type === 'lightning';
const protocol = isLightning ? 'lightning' : 'bitcoin';

console.log(`Generating snippets for ${isLightning ? 'Lightning' : 'Bitcoin'} Address: ${safeAddr}...\n`);

// 1. Generate Markdown Snippet
const badgeLabel = isLightning ? 'Tip_Me-Lightning' : 'Tip_Me-Bitcoin';
const badgeLogo = isLightning ? 'lightning' : 'bitcoin';
const badgeColor = isLightning ? '792EE5' : 'F7931A';
const markdownCode = `[![Tip Me](https://img.shields.io/badge/${badgeLabel}-${badgeColor}?style=for-the-badge&logo=${badgeLogo}&logoColor=white)](${protocol}:${safeAddr})`;

// 2. Generate HTML Widget Code
const buttonText = isLightning ? 'Tip via Lightning' : 'Tip Me in Bitcoin';
const buttonIcon = isLightning 
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 2-2 2.5h3L12 7"/><path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727"/></svg>';
const titleText = isLightning ? 'Lightning Tip' : 'Support my work';
const subtitleText = isLightning ? 'Scan to send via Lightning' : 'Scan to send Bitcoin';
const primaryColor = isLightning ? '#792EE5' : '#F7931A';
const gradientColors = isLightning ? '#792EE5, #9d4edd' : '#F7931A, #e08316';
const shadowColor = isLightning ? 'rgba(121, 46, 229, 0.3)' : 'rgba(247, 147, 26, 0.3)';
const shadowHoverColor = isLightning ? 'rgba(121, 46, 229, 0.4)' : 'rgba(247, 147, 26, 0.4)';

const widgetCode = `<!-- Tip Widget -->
<style>
  .btc-tip-btn {
    background: linear-gradient(135deg, ${gradientColors});
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: 'Inter', system-ui, sans-serif;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 12px ${shadowColor};
  }
  .btc-tip-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${shadowHoverColor};
  }
  .btc-modal-overlay {
    display: none;
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 999999;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .btc-modal-overlay.show {
    opacity: 1;
  }
  .btc-modal {
    background: #1e293b;
    color: #f8fafc;
    padding: 32px 24px;
    border-radius: 20px;
    text-align: center;
    font-family: 'Inter', system-ui, sans-serif;
    width: 90%;
    max-width: 360px;
    position: relative;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    border: 1px solid #334155;
    transform: translateY(20px);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .btc-modal-overlay.show .btc-modal {
    transform: translateY(0);
  }
  .btc-close {
    position: absolute;
    top: 16px; right: 20px;
    cursor: pointer;
    font-size: 28px;
    line-height: 1;
    color: #94a3b8;
    transition: color 0.2s;
  }
  .btc-close:hover {
    color: #f8fafc;
  }
  .btc-modal h3 {
    margin: 0 0 8px 0;
    font-size: 1.5rem;
    color: ${primaryColor};
  }
  .btc-modal p {
    color: #94a3b8;
    margin: 0 0 20px 0;
    font-size: 0.95rem;
  }
  .btc-address-box {
    background: #0f172a;
    padding: 14px;
    border-radius: 10px;
    font-size: 13px;
    margin: 20px 0;
    word-break: break-all;
    border: 1px solid #334155;
    color: #e2e8f0;
    font-family: monospace;
  }
  .btc-copy-btn {
    background: #334155;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    width: 100%;
    font-size: 15px;
  }
  .btc-copy-btn:hover {
    background: #475569;
  }
  #btc-qr-container {
    background: white;
    padding: 16px;
    border-radius: 12px;
    display: inline-block;
    margin: 0 auto;
  }
</style>

<button class="btc-tip-btn" onclick="openBtcModal()">
  ${buttonIcon}
  ${buttonText}
</button>

<div id="btc-modal-wrapper" class="btc-modal-overlay" onclick="if(event.target === this) closeBtcModal()">
  <div class="btc-modal">
    <span class="btc-close" onclick="closeBtcModal()">&times;</span>
    <h3>${titleText}</h3>
    <p>${subtitleText}</p>
    <div id="btc-qr-container"></div>
    <div class="btc-address-box" id="btc-address-text">${safeAddr}</div>
    <button class="btc-copy-btn" id="btc-copy-action" onclick="copyBtcAddress()">Copy Address</button>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
<script>
  var btcQrGenerated = false;
  
  function openBtcModal() {
    const wrapper = document.getElementById('btc-modal-wrapper');
    wrapper.style.display = 'flex';
    setTimeout(() => wrapper.classList.add('show'), 10);
    
    if (!btcQrGenerated) {
      new QRCode(document.getElementById("btc-qr-container"), {
        text: "${protocol}:${safeAddr}",
        width: 160,
        height: 160,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.M
      });
      btcQrGenerated = true;
    }
  }

  function closeBtcModal() {
    const wrapper = document.getElementById('btc-modal-wrapper');
    wrapper.classList.remove('show');
    setTimeout(() => wrapper.style.display = 'none', 300);
  }

  function copyBtcAddress() {
    navigator.clipboard.writeText('${safeAddr}').then(() => {
      const btn = document.getElementById('btc-copy-action');
      const originalText = btn.innerText;
      btn.innerText = 'Copied!';
      btn.style.background = '#10b981'; // Success green
      setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = '#334155';
      }, 2000);
    });
  }
<\/script>
<!-- End Tip Widget -->`;`;

fs.writeFileSync('widget.html', widgetCode);
fs.writeFileSync('badge.md', markdownCode);

console.log('✅ Generated widget.html');
console.log('✅ Generated badge.md');
console.log('\nYou can now use these files directly!');
