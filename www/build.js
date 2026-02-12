const fs = require('fs');
const path = require('path');

// Generate timestamp for cache busting
const timestamp = new Date().getTime();
const version = `3.1.${timestamp}`;

// Update HTML file with new version
const htmlPath = path.join(__dirname, 'index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Replace version numbers
htmlContent = htmlContent.replace(/style\.css\?v=[\d.]+/g, `style.css?v=${version}`);
htmlContent = htmlContent.replace(/app\.js\?v=[\d.]+/g, `app.js?v=${version}`);
htmlContent = htmlContent.replace(/const swVersion = '[\d.]+';/g, `const swVersion = '${version}';`);

fs.writeFileSync(htmlPath, htmlContent);

// Update service worker
const swPath = path.join(__dirname, 'sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');
if (!swContent.includes(`// Version: ${version}`)) {
    swContent = `// Version: ${version}\n${swContent}`;
    fs.writeFileSync(swPath, swContent);
}

console.log(`✅ Updated to version ${version}`);
console.log('📦 Build completed successfully!');
