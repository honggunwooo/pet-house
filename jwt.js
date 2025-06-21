const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const secret = process.env.JWT_SECRET || 'your-default-secret-key';  // 비밀 키 기본값 설정

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: '7d' }  
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
    }
    req.user = user;  // JWT에서 사용자 정보 추출하여 req.user에 저장
    console.log('Authenticated User:', req.user);  // 디버깅: 인증된 사용자 정보 출력
    next();
  });
}

module.exports = { generateToken, authenticateToken };
