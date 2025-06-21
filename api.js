const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();
const API_KEY = process.env.PET_API_KEY;
const BASE_URL = 'https://apis.data.go.kr/1543061/abandonmentPublicService_v2/abandonmentPublic_v2';

// 미들웨어
router.use(cors());
router.use(express.json());

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

// 📌 동물 목록 조회
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

// POST /api/animals - 목록 조회
router.post('/', async (req, res) => {
  try {
    const pageNo = req.body?.data?.pagenumber || 1;
    const { numOfRows = 9, upr_cd, org_cd, kind, neuter_yn } = req.body;
    const data = await getAnimalList({ pageNo, numOfRows, upr_cd, org_cd, kind, neuter_yn });
    res.json(data);
  } catch (err) {
    console.error('❌ 동물 목록 조회 오류:', err.message);
    res.status(500).json({ message: '동물 목록을 불러올 수 없습니다.', error: err.message });
  }
});

// GET /api/animals/:desertionNo - 상세 조회
router.get('/:desertionNo', async (req, res) => {
  console.log('✅ 요청 들어옴:', req.params.desertionNo);
  const { desertionNo } = req.params;

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        serviceKey: API_KEY,
        _type: 'json',
        desertionNo,
      },
    });

    const item = response.data?.response?.body?.items?.item;

    if (!item) {
      return res.status(404).json({ message: '해당 동물 정보를 찾을 수 없습니다.' });
    }

    res.json({
      desertionNo: item.desertionNo,
      happenDt: item.happenDt,
      happenPlace: item.happenPlace,
      kindNm: item.kindNm,
      age: item.age,
      weight: item.weight,
      colorCd: item.colorCd,
      sexCd: item.sexCd,
      neuterYn: item.neuterYn,
      specialMark: item.specialMark,
      processState: item.processState,
      noticeNo: item.noticeNo,
      noticeSdt: item.noticeSdt,
      noticeEdt: item.noticeEdt,
      careNm: item.careNm,
      careTel: item.careTel,
      careAddr: item.careAddr,
      popfile1: item.popfile || '',      // 이미지 1
      popfile2: item.popfile2 || '',     // 이미지 2
    });
  } catch (err) {
    console.error('상세 정보 조회 오류:', err.response?.data || err.message);
    res.status(500).json({ message: '상세 정보를 불러오는 데 실패했습니다.', error: err.message });
  }
});

module.exports = router;
