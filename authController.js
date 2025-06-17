const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { email, password, name } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.run(
    `INSERT INTO users (email, password, name) VALUES (?, ?, ?)`,
    [email, hashed, name],
    function (err) {
      if (err) return res.status(500).json({ message: '중복 이메일' });
      res.json({ message: '회원가입 완료' });
    }
  );
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) return res.status(401).json({ message: '사용자 없음' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: '비밀번호 오류' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { name: user.name, role: user.role } });
  });
};
