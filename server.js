const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./auth');
const animalRoutes = require('./api');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);

app.get('/', (req, res) => {
  res.send('PetHouse 백엔드 서버 동작 중');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중 http://localhost:${PORT}`);
});
