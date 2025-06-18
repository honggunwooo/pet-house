const express = require('express');
const db = require('./db');
const { authenticateToken } = require('./jwt');
const router = express.Router();

// 입양 신청 목록 조회 (GET /api/adopt)
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  console.log('현재 로그인한 userId:', userId);  // 디버깅용 출력

  db.all('SELECT * FROM applications WHERE userId = ?', [userId], (err, rows) => {
    if (err) {
      console.error('DB 조회 오류:', err);
      return res.status(500).json({ message: '신청 목록 조회 실패' });
    }

    console.log('DB 조회 결과:', rows);  // 디버깅용 출력
    res.json(rows);
  });
});

// 입양 신청 등록 (POST /api/adopt)
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { animalId, message } = req.body;

  console.log('입양 신청 데이터:', { userId, animalId, message });  // 디버깅용 출력

  db.get(
    'SELECT * FROM interests WHERE userId = ? AND animalId = ?',
    [userId, animalId],
    (err, row) => {
      if (err) {
        console.error('interests 테이블 조회 실패:', err);
        return res.status(500).json({ message: 'interests 조회 실패' });
      }

      if (!row) {
        console.log('해당 관심 동물이 없습니다.');
        return res.status(404).json({ message: '해당 관심 동물이 없습니다.' });
      }

      db.run(
        'INSERT INTO applications (userId, animalId, message) VALUES (?, ?, ?)',
        [userId, animalId, message || ''],
        function (err) {
          if (err) {
            console.error('입양 신청 등록 실패:', err);
            return res.status(500).json({ message: '입양 신청 등록 실패' });
          }

          console.log('입양 신청 등록 성공, ID:', this.lastID);
          res.json({ message: '입양 신청 완료', id: this.lastID });
        }
      );
    }
  );
});

// 입양 신청 취소 (DELETE /api/adopt/:id)
router.delete('/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const applicationId = req.params.id;

  console.log('입양 신청 취소 요청:', { userId, applicationId });

  db.run(
    'DELETE FROM applications WHERE id = ? AND userId = ?',
    [applicationId, userId],
    function (err) {
      if (err) {
        console.error('DELETE 오류:', err);
        return res.status(500).json({ message: '신청 삭제 실패' });
      }

      if (this.changes === 0) {
        console.log('삭제 대상 없음');
        return res.status(404).json({ message: '해당 신청 없음' });
      }

      console.log('신청 삭제 성공');
      res.json({ message: '입양 신청이 취소되었습니다.' });
    }
  );
});

module.exports = router;
