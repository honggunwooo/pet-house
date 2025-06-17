const express = require('express');
const db = require('./db');
const { authenticateToken } = require('./jwt');
const router = express.Router();

// 관심 동물 목록 조회
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all('SELECT * FROM interests WHERE userId = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB 조회 오류' });
    res.json(rows);
  });
});

// 관심 등록 추가
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { animalId } = req.body;

  if (!animalId) return res.status(400).json({ message: 'animalId가 필요합니다.' });

  db.run(
    'INSERT INTO interests (userId, animalId) VALUES (?, ?)',
    [userId, animalId],
    function (err) {
      if (err) return res.status(500).json({ message: 'DB 저장 오류' });
      res.json({ message: '관심 동물로 등록되었습니다.', id: this.lastID });
    }
  );
});

// 관심 등록 삭제
router.delete('/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const interestId = req.params.id;

  db.run('DELETE FROM interests WHERE id = ? AND userId = ?', [interestId, userId], function (err) {
    if (err) return res.status(500).json({ message: '삭제 실패' });
    if (this.changes === 0) return res.status(404).json({ message: '해당 관심 등록 없음' });
    res.json({ message: '관심 동물에서 제거되었습니다.' });
  });
});

module.exports = router;
