const express = require('express');
const axios = require('axios');
const router = express.Router();

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

// 사용자의 좌표와 보호소 주소를 받아서 거리/시간 계산
router.get('/route', async (req, res) => {
  const { address, userLat, userLng } = req.query;

  if (!address || !userLat || !userLng) {
    return res.status(400).json({ error: '필수 파라미터(address, userLat, userLng)가 필요합니다.' });
  }

  try {
    // 1️⃣ 보호소 주소 → 좌표 변환
    const coordRes = await axios.get('https://dapi.kakao.com/v2/local/search/address.json', {
      params: { query: address },
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
    });

    const documents = coordRes.data.documents;
    if (!documents || documents.length === 0) {
      return res.status(404).json({ error: '주소를 좌표로 변환할 수 없습니다.' });
    }

    const shelterLat = documents[0].y;
    const shelterLng = documents[0].x;

    // 거리 및 시간 계산 (자동차 기준)
    const routeRes = await axios.get('https://apis-navi.kakaomobility.com/v1/directions', {
      params: {
        origin: `${userLng},${userLat}`,
        destination: `${shelterLng},${shelterLat}`,
      },
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
    });

    const route = routeRes.data.routes[0].summary;

    res.json({
      shelterCoords: {
        lat: shelterLat,
        lng: shelterLng,
      },
      distance: `${(route.distance / 1000).toFixed(1)} km`,
      duration: `${Math.ceil(route.duration / 60)}분`,
    });
  } catch (err) {
    console.error('Kakao API 오류:', err.message);
    res.status(500).json({ error: '카카오 API 호출 실패' });
  }
});

module.exports = router;
