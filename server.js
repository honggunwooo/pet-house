const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const authRoutes = require('./auth');
const animalRoutes = require('./api');
const interestRoutes = require('./interests');
const adoptRoutes = require('./adopt');

dotenv.config();
const app = express();

// morgan 설정 (로그 확인)
app.use(morgan('dev'));

// CORS 설정 (프론트 주소만 허용)
app.use(cors({
  origin: 'http://localhost:3000',  // 프론트 주소 (프론트가 3000 포트를 사용한다고 가정)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 라우터 연결
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/adopt', adoptRoutes);

// 홈 페이지
app.get('/', (req, res) => {
  res.send('PetHouse 백엔드 서버 동작 중');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중 http://localhost:${PORT}`);
});
