// src/profile.js
const express = require('express');
const db = require('./db');
const { authenticateToken } = require('./jwt'); // JWT 인증 미들웨어

const router = express.Router();

// 사용자 정보 조회 API
router.get('/user/profile', authenticateToken, (req, res) => {
  console.log("User profile API called");  // 로그 확인용

  const userId = req.user.id;  // JWT에서 사용자 ID 추출
  console.log("Authenticated user ID:", userId);  // 인증된 사용자 ID 출력

  db.get('SELECT id, email, name, profileImage FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
      console.error('DB 조회 오류:', err);  // DB 오류 출력
      return res.status(500).json({ message: '서버 오류' });
    }
    
    if (!row) {
      console.log('사용자 정보 없음', userId);  // 사용자 정보가 없을 때 출력
      return res.status(404).json({ message: '사용자 정보 조회 실패' });
    }

    res.json(row);  // 사용자 정보 반환
  });
});

// 프로필 이미지 업데이트 API
router.put('/user/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;  // JWT에서 사용자 ID 추출
  const { profileImage } = req.body;  // 요청 바디에서 profileImage 값 추출

  db.run('UPDATE users SET profileImage = ? WHERE id = ?', [profileImage, userId], function(err) {
    if (err) {
      console.error('프로필 이미지 업데이트 오류:', err);
      return res.status(500).json({ message: '프로필 이미지 업데이트 실패' });
    }
    res.json({ message: '프로필 이미지 업데이트 성공' });
  });
});

module.exports = router;
