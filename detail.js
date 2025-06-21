
const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_KEY = process.env.PET_API_KEY;
const BASE_URL = 'https://apis.data.go.kr/1543061/abandonmentPublicSrvc/abandonmentPublic';

router.get('/:desertionNo', async (req, res) => {
  const { desertionNo } = req.params;

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        serviceKey: API_KEY,
        _type: 'json',
        desertionNo,
      },
    });

    const item = response.data?.response?.body?.items?.item?.[0];

    if (!item) {
      return res.status(404).json({ message: '해당 동물의 정보를 찾을 수 없습니다.' });
    }

    const detail = {
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
      popfile1: item.popfile1,
      popfile2: item.popfile2,
    };

    res.json(detail);
  } catch (error) {
    console.error('🔴 상세 정보 조회 오류:', error.message);
    res.status(500).json({ message: '서버 오류로 정보를 가져오지 못했습니다.' });
  }
});

module.exports = router;
