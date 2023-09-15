const express = require('express');
const rateLimit = require('express-rate-limit');
const { ServerConfig, Queue } = require('./config');
const apiRoutes = require('./routes');
const { AuthRequestMiddlewares } = require('./middlewares');
const { createProxyMiddleware } = require('http-proxy-middleware');
// const CRON = require('./src/utils/common');

const app = express();

const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 2 minutes
	max: 30, // Limit each IP to 2 requests per `window` (here, per 15 minutes)
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(limiter);

console.log( ServerConfig.FLIGHT_SERVICE);
app.use('/flightsService', AuthRequestMiddlewares.checkAuth, createProxyMiddleware({ 
    target: ServerConfig.FLIGHT_SERVICE, 
    changeOrigin: true, 
    pathRewrite: {'^/flightsService' : '/'} 
}));

app.use('/bookingService', AuthRequestMiddlewares.checkAuth, createProxyMiddleware({ 
    target: ServerConfig.BOOKING_SERVICE}));

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, async () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
});
