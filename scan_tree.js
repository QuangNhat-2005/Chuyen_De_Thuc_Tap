const fs = require('fs');
const path = require('path');

// Các thư mục hoặc file muốn bỏ qua (để Prompt không bị quá dài)
const IGNORE_LIST = ['node_modules', '.git', '.vscode', 'dist', 'build', 'coverage', '.DS_Store'];

function getFileTree(dir, depth = 0) {
    const indent = '  '.repeat(depth);
    const files = fs.readdirSync(dir);
    let output = '';

    files.forEach(file => {
        if (IGNORE_LIST.includes(file)) return; // Bỏ qua file rác

        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            output += `${indent}📁 ${file}/\n`;
            output += getFileTree(filePath, depth + 1);
        } else {
            output += `${indent}📄 ${file}\n`;
        }
    });
    return output;
}

// Chạy và in ra kết quả
try {
    const tree = getFileTree(__dirname);
    console.log("=== CẤU TRÚC DỰ ÁN ===");
    console.log(tree);
    console.log("======================");
} catch (err) {
    console.error("Có lỗi xảy ra:", err.message);
}