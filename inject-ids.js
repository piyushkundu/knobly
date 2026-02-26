const fs = require('fs');
const path = require('path');

function slugify(text) {
    return text.toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern to match <h2 ...>Text</h2> or <h3 ...>Text</h3>
    // It captures:
    // 1: Tag name (h2 or h3)
    // 2: Any existing attributes (like className)
    // 3: Inner text (excluding nested tags for simplicity, or lazy matching)
    // The regex is designed to avoid replacing if id= already exists.

    const hRegex = /<(h[23])([^>]*)>([^<]+)<\/\1>/gi;

    content = content.replace(hRegex, (match, tag, attrs, text) => {
        // If it already has an id, skip
        if (attrs.includes('id=')) return match;

        const slug = slugify(text);
        if (!slug) return match; // skip if empty slug

        modified = true;
        return `<${tag} id="${slug}"${attrs}>${text}</${tag}>`;
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[UPDATED] ${filePath}`);
    }
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.tsx')) {
            processFile(filePath);
        }
    }
}

const baseDir = path.join(__dirname, 'src', 'app');
const dirsToProcess = ['python', 'html', 'web-design', 'cybersecurity', 'iot', 'ccc', 'notes'];

for (const d of dirsToProcess) {
    walkDir(path.join(baseDir, d));
}

console.log("Injection complete.");
