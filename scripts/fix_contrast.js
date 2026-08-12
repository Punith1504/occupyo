const fs = require('fs');
const path = require('path');

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Skip lines that have dark backgrounds explicitly
        const hasDarkBg = /bg-black|bg-gray-800|bg-gray-900|bg-gray-950|bg-indigo-600|bg-teal-500|bg-teal-600|bg-teal-700|bg-blue-|bg-red-|bg-green-|glass-button(?!-)/.test(line);
        
        if (!hasDarkBg) {
            line = line.replace(/text-white\/80/g, 'text-gray-500');
            line = line.replace(/text-white\/70/g, 'text-gray-500');
            line = line.replace(/text-white\/60/g, 'text-gray-500');
            line = line.replace(/text-white\/50/g, 'text-gray-400');
            line = line.replace(/text-white\/40/g, 'text-gray-400');
            line = line.replace(/text-white\/30/g, 'text-gray-300');
            line = line.replace(/text-white\/20/g, 'text-gray-300');
            line = line.replace(/text-white\/10/g, 'text-gray-200');
            line = line.replace(/text-white(?![\/\w])/g, 'text-gray-900');
        }

        line = line.replace(/bg-white\/5(?![\w])/g, 'bg-gray-50');
        line = line.replace(/bg-white\/10(?![\w])/g, 'bg-gray-100');
        line = line.replace(/bg-white\/20(?![\w])/g, 'bg-gray-100/50');
        line = line.replace(/border-white\/10(?![\w])/g, 'border-gray-100');
        line = line.replace(/border-white\/20(?![\w])/g, 'border-gray-200');
        line = line.replace(/border-white\/30(?![\w])/g, 'border-gray-300');

        line = line.replace(/text-\[\#a1ebd6\]/g, 'text-teal-700');
        line = line.replace(/text-\[\#b4e6ff\]/g, 'text-sky-700');
        
        lines[i] = line;
    }
    
    let newContent = lines.join('\n');
    if (original !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log('Updated: ' + filePath);
    }
}

processDir(path.join(__dirname, '../src/app'));
processDir(path.join(__dirname, '../src/components'));
