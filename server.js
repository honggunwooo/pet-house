const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const apiRoutes = require('./api');            // 동물 목록
const authRoutes = require('./auth');
const adoptRoutes = require('./adopt');
const interestRoutes = require('./interests');
const detailRoutes = require('./detail');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/animals', apiRoutes);     // 목록
app.use('/api/auth', authRoutes);
app.use('/api/adopt', adoptRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/detail', detailRoutes);

app.get('/', (req, res) => {
  res.send('PetHouse 백엔드 서버 실행 중!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중 http://localhost:${PORT}`);
});
