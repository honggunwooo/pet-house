const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // jwt 임포트
const db = require('./db');
const { generateToken } = require('./jwt');

const router = express.Router();

// 토큰을 블랙리스트로 관리 (메모리 사용, DB나 Redis로 변경 가능)
let jwtBlacklist = [];

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: '토큰이 없습니다.' });

  // 토큰이 블랙리스트에 있으면 인증 실패 처리
  if (jwtBlacklist.includes(token)) {
    return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
  }

  // 토큰 검증
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
    req.user = user;
    next();
  });
}

// 회원가입
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

// 로그인
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

// 로그아웃
router.post('/logout', authenticateToken, (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token) {
    // 블랙리스트에 토큰 추가
    jwtBlacklist.push(token);
    res.json({ message: '로그아웃 성공' });
  } else {
    res.status(400).json({ message: '토큰이 없습니다.' });
  }
});

module.exports = router;
