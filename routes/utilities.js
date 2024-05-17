const express = require('express');
const router = express.Router();
const { chart, ukMap, uaCities, insa, geojson } = require('../controllers/utilities');
const { route } = require('./core');

router.get('/chart', chart);
router.get('/map', ukMap);
router.get('/ua-cities', uaCities);
router.get('/insa', insa)
router.get('geojson', geojson)

module.exports = router;
