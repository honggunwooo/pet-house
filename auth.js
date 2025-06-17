const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');
const { generateToken } = require('./jwt');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: '모든 항목을 입력해주세요.' });
  }

  try {
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
      if (row) {
        return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
      }

      const hash = await bcrypt.hash(password, 10);
      db.run('INSERT INTO users (email, passwordHash, name, role) VALUES (?, ?, ?, ?)',
        [email, hash, name, 'user'],
        function (err) {
          if (err) {
            console.error('회원가입 오류:', err);
            return res.status(500).json({ message: '서버 오류' });
          }
          res.json({ message: '회원가입 완료' });
        });
    });
  } catch (err) {
    console.error('회원가입 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });
});

module.exports = router;
