# Bitcoin Tip Widget Generator

A beautiful, client-side, zero-dependency (using a CDN for QR codes) web application that generates "Tip Me in Bitcoin" widgets for your website and Markdown badges for your GitHub READMEs.

[![Tip Me](https://img.shields.io/badge/Tip_Me-Lightning-792EE5?style=flat&logo=lightning&logoColor=white)](https://quickchart.io/qr?size=500&text=lightning:lnbc1p5l7xhrpp59gny7x55gvcmmv8ukg9kajec493mhf93qujl3a3j3sq5epvghmmqdqqcqzzsxqrrs0fppqk2gu4kh4m397g4few2y86jx6876dvccysp5llsaw0ddlep6vlutdqzlsx2yxtxfrke5jl5393tqm3x705rqnrls9qxpqysgqrdh4e0vgsvpyz0a7sdf5dypw7gvfsf0jxj6rapsy7840jzudf5wyvcfjqm0j3r5yztfhnd7k8750zq39x2v6rgkrq6r75v4q8ur0hxqpg73795)

## Features

- **Website Widget**: Generates an interactive, beautiful HTML/JS button and modal that you can embed on any personal website. Uses a lightweight CDN for QR code generation.
- **Markdown Badge**: Generates a static GitHub-friendly Shields.io badge that directly opens a `bitcoin:<address>` URI on click.
- **Premium Design**: Dark mode interface, glassmorphism, smooth animations, and a modern aesthetic.
- **Privacy First**: Fully client-side. Your Bitcoin address is never sent to any server.

## Getting Started

1. Clone or download this repository.
2. Open `index.html` in any modern web browser.
3. Paste your Bitcoin wallet address.
4. Click **Generate** and copy your desired snippet!

## Usage

### The Website Widget
Embed the generated HTML code directly into your website's body. The widget includes scoped CSS and minimal Vanilla JS. It will render a beautiful "Tip Me in Bitcoin" button. When visitors click it, they will see a modal with your generated QR code and address.

### The Markdown Badge
Paste the generated Markdown code into your GitHub profile `README.md` or any other Markdown-supported platform where JavaScript is restricted.

## Technologies Used
- HTML5
- Vanilla CSS3 (Custom Properties, Flexbox, Animations)
- Vanilla JavaScript
- [qrcode.js](https://davidshimjs.github.io/qrcodejs/) (via CDN)
- [Shields.io](https://shields.io/) (for static badges)

## License
MIT License
