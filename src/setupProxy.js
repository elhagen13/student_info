const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://54.161.75.178:3000', 
      changeOrigin: true,
      secure: false, 
    })
  );
};