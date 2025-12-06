const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ép Metro chỉ tìm thư viện trong thư mục hiện tại
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

// Chặn không cho nhìn ra thư mục gốc
config.watchFolders = [__dirname];

module.exports = config;