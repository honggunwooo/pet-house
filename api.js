const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();
const API_KEY = process.env.PET_API_KEY;
const BASE_URL = 'https://apis.data.go.kr/1543061/abandonmentPublicService_v2/abandonmentPublic_v2';

// 날짜 포맷 함수 (YYYYMMDD)
function formatDate(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

// 최근 일주일 범위 반환
function getDateRange() {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { today, weekAgo };
}

// 동물 데이터 요청 함수
async function getAnimalList({ pageNo, numOfRows, upr_cd, org_cd, kind, neuter_yn }) {
  const { today, weekAgo } = getDateRange();
  const res = await axios.get(BASE_URL, {
    params: {
      serviceKey: API_KEY,
      _type: 'json',
      numOfRows,
      pageNo,
      bgnde: formatDate(weekAgo),
      endde: formatDate(today),
      state: 'notice',
      upr_cd,
      org_cd,
      kind,
      neuter_yn,
    },
  });

  const result = res.data;
  if (!result.response || result.response.header.resultCode !== '00') {
    throw new Error(result.response?.header?.resultMsg || 'API 응답 오류');
  }

  const body = result.response.body;
  return {
    totalCount: body.totalCount || 0,
    currentPage: pageNo,
    items: body.items?.item || [],
  };
}

// POST /api/animals
router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const pageNo = body.pagenumber || 1;
    const numOfRows = body.numOfRows || 9;
    const { upr_cd, org_cd, kind, neuter_yn } = body;

    const data = await getAnimalList({
      pageNo,
      numOfRows,
      upr_cd,
      org_cd,
      kind,
      neuter_yn,
    });

    res.json(data);
  } catch (err) {
    console.error('❌ 동물 목록 조회 오류:', err.message);
    res.status(500).json({ message: '동물 목록을 불러올 수 없습니다.', error: err.message });
  }
});

module.exports = router;
