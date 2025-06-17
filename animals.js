// // animals.js
// const express = require('express');
// const axios = require('axios');
// const router = express.Router();

// require('dotenv').config();

// const API_KEY = process.env.PET_API_KEY;
// const BASE_URL = 'https://apis.data.go.kr/1543061/abandonmentPublicService_v2/abandonmentPublic_v2'; // ✅ 정확한 경로

// function formatDate(date) {
//   return date.toISOString().slice(0, 10).replace(/-/g, '');
// }

// router.get('/', async (req, res) => {
//   const today = new Date();
//   const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

//   try {
//     const response = await axios.get(BASE_URL, {
//       params: {
//         serviceKey: API_KEY,
//         _type: 'json',
//         numOfRows: 10,
//         pageNo: 1,
//         bgnde: formatDate(weekAgo),
//         endde: formatDate(today),
//       },
//     });

//     const result = response.data;

//     if (!result.response || result.response.header.resultCode !== '00') {
//       return res.status(400).json({
//         message: 'API 실패',
//         detail: result.response?.header?.resultMsg || '알 수 없는 오류',
//       });
//     }

//     res.json(result.response.body.items?.item || []);
//   } catch (error) {
//     console.error('❌ API 호출 오류:', error.response?.data || error.message);
//     res.status(500).json({
//       message: '서버 오류',
//       error: error.response?.data || error.message,
//     });
//   }
// });

// module.exports = router;
