const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

const authRoutes = require('./auth');
const animalRoutes = require('./api');
const datailRoutes = require('./datail');
const interestRoutes = require('./interests');
const adoptRoutes = require('./adopt');
const kakaoRoutes = require('./kakao');

dotenv.config();
const app = express();

// 공통 미들웨어
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(morgan('dev'));


app.use((req, res, next) => {
  if (req.method === 'GET') return next();
  express.json()(req, res, next);
});
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/datail', datailRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/adopt', adoptRoutes);
app.use('/api/kakao', kakaoRoutes);


app.get('/', (req, res) => {
  res.send('PetHouse 백엔드 서버 동작 중');
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`서버 실행 중 http://localhost:${PORT}`);
});
