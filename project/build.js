/**
 * build.js
 * Reads section HTML files from /sections/ and embeds them as hidden DOM templates
 * in index.html, between <!-- SECTION-TEMPLATES-START --> and <!-- SECTION-TEMPLATES-END --> markers.
 *
 * Usage: node build.js
 */

const fs = require('fs');
const path = require('path');

const SECTION_ORDER = ['evolusjon', 'anatomi', 'predator-vision', 'ernaring', 'sykdom', 'debunking', 'lipider', 'konklusjon'];
const SECTIONS_DIR = path.join(__dirname, 'sections');
const INDEX_FILE = path.join(__dirname, 'index.html');

// Read a section file and strip the outer <section> wrapper
function readSectionContent(slug) {
    const filePath = path.join(SECTIONS_DIR, slug + '.html');
    let content = fs.readFileSync(filePath, 'utf-8');

    // Remove the wrapping <section> tags and the id attribute
    content = content.replace(/<section\s+class="section-article"\s+id="[^"]+">\n?/i, '');
    content = content.replace(/<\/section>\s*$/, '');

    // Trim trailing whitespace
    content = content.replace(/\s+$/, '');

    return content;
}

// Generate template HTML for a section
function generateTemplate(slug) {
    const content = readSectionContent(slug);
    return `<div data-section="${slug}">\n${content}\n</div>`;
}

// Build the index.html
function build() {
    console.log('Building section templates into index.html...');

    let indexHtml = fs.readFileSync(INDEX_FILE, 'utf-8');

    // Generate all template blocks
    const templateBlocks = SECTION_ORDER.map(slug => generateTemplate(slug));
    const templatesHtml = templateBlocks.join('\n');

    // Replace content between markers
    const startMarker = '<!-- SECTION-TEMPLATES-START -->';
    const endMarker = '<!-- SECTION-TEMPLATES-END -->';

    const startIdx = indexHtml.indexOf(startMarker);
    const endIdx = indexHtml.indexOf(endMarker);

    if (startIdx === -1 || endIdx === -1) {
        console.error('ERROR: Could not find template markers in index.html');
        console.error('Look for: ' + startMarker + ' and ' + endMarker);
        process.exit(1);
    }

    const before = indexHtml.substring(0, startIdx + startMarker.length);
    const after = indexHtml.substring(endIdx);

    const newHtml = before + '\n' + templatesHtml + '\n    ' + after;

    fs.writeFileSync(INDEX_FILE, newHtml, 'utf-8');

    console.log('✅ Build complete! ' + SECTION_ORDER.length + ' sections embedded.');
    console.log('Section order:', SECTION_ORDER.join(' → '));
}

build();
