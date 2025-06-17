require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { register, login } = require('./authController');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 서버 실행 중 http://localhost:${PORT}`));
