const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

const authRoutes = require('./auth');
const animalRoutes = require('./api'); 
const interestRoutes = require('./interests');
const adoptRoutes = require('./adopt');
const detailRoutes = require('./detail');
const kakaoRoutes = require('./kakao');

dotenv.config();
const app = express();

// 미들웨어
app.use(morgan('dev'));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// 라우터 연결
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes); 
app.use('/api/interests', interestRoutes);
app.use('/api/adopt', adoptRoutes);
app.use('/api/detail', detailRoutes);
app.use('/api/kakao', kakaoRoutes);

// 기본 라우터
app.get('/', (req, res) => {
  res.send('PetHouse 백엔드 서버 동작 중');
});

// 서버 실행
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`서버 실행 중 http://localhost:${PORT}`);
});
