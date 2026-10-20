// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Chỉ cần cho bản web (npm run web): expo-sqlite trên web chạy SQLite bằng file .wasm
config.resolver.assetExts.push('wasm');

module.exports = config;
