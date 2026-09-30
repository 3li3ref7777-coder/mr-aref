const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/mr-aref/'
    : '/',
  configureWebpack: {
    performance: {
      hints: false, // لإيقاف ظهور تحذير حجم الملفات تماماً
      maxEntrypointSize: 512000, // رفع الحد المسموح به إلى 500KiB
      maxAssetSize: 512000
    }
  }
})