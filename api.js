const express = require('express');
const axios = require('axios');
const router = express.Router();

require('dotenv').config();

const API_KEY = process.env.PET_API_KEY;
const BASE_URL = 'https://apis.data.go.kr/1543061/abandonmentPublicService_v2/abandonmentPublic_v2';

// 날짜 포맷: yyyyMMdd
function formatDate(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

router.get('/', async (req, res) => {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 쿼리 파라미터 받기
  const {
    pageNo = 1,
    upr_cd,      // 시도코드
    org_cd,      // 시군구코드
    kind,        // 품종
    neuter_yn    // 중성화 여부 (Y/N/U)
  } = req.query;

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        serviceKey: API_KEY,
        _type: 'json',
        numOfRows: 10,
        pageNo,
        bgnde: formatDate(weekAgo),
        endde: formatDate(today),
        state: 'notice', // 공고 중만 보기
        upr_cd,
        org_cd,
        kind,
        neuter_yn
      }
    });

    const result = response.data;

    if (!result.response || result.response.header.resultCode !== '00') {
      return res.status(400).json({
        message: 'API 실패',
        detail: result.response?.header?.resultMsg || '알 수 없는 오류',
      });
    }

    const body = result.response.body;

    res.json({
      totalCount: body.totalCount,
      currentPage: body.pageNo,
      items: body.items?.item || []
    });

  } catch (error) {
    console.error('❌ API 호출 오류:', {
      url: BASE_URL,
      params: {
        pageNo,
        upr_cd,
        org_cd,
        kind,
        neuter_yn,
        bgnde: formatDate(weekAgo),
        endde: formatDate(today),
        state: 'notice'
      },
      error: error.response?.data || error.message
    });

    res.status(500).json({
      message: '서버 오류',
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;
