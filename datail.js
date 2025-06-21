const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();
const API_KEY = process.env.PET_API_KEY;
const BASE_URL = 'https://apis.data.go.kr/1543061/abandonmentPublicService_v2/abandonmentPublic_v2';

// /api/detail/:desertionNo
router.get('/:desertionNo', async (req, res) => {
  const { desertionNo } = req.params;
  console.log('✅ 상세 요청 도착:', desertionNo);

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        serviceKey: API_KEY,
        _type: 'json',
        desertionNo,
      },
    });


    console.log('🧪 공공 API 응답 원본:', JSON.stringify(response.data, null, 2));

    const item = response.data?.response?.body?.items?.item;

    if (!item) {
      console.log('⚠️ item이 존재하지 않음 (null 또는 undefined)');
      return res.status(404).json({ message: '해당 동물 정보를 찾을 수 없습니다.' });
    }

    const data = Array.isArray(item) ? item[0] : item;


    console.log('✅ 상세 데이터 추출:', data);

    res.json({
      desertionNo: data.desertionNo,
      happenDt: data.happenDt,
      happenPlace: data.happenPlace,
      kindNm: data.kindNm,
      age: data.age,
      weight: data.weight,
      colorCd: data.colorCd,
      sexCd: data.sexCd,
      neuterYn: data.neuterYn,
      specialMark: data.specialMark,
      processState: data.processState,
      noticeNo: data.noticeNo,
      noticeSdt: data.noticeSdt,
      noticeEdt: data.noticeEdt,
      careNm: data.careNm,
      careTel: data.careTel,
      careAddr: data.careAddr,
      popfile1: data.popfile || '',
      popfile2: data.popfile2 || '',
    });
  } catch (err) {
    console.error('❌ 상세 조회 실패:', err.response?.data || err.message);
    res.status(500).json({ message: '상세 정보를 불러오는 데 실패했습니다.', error: err.message });
  }
});

module.exports = router;
