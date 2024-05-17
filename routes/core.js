const express = require('express');
const router = express.Router();
const {
    getLayout,
    getPlaylists,
    player,
    createPlaylist,
    deletePlaylist
} = require('../controllers/core');

router.get('/play', player);
router.get('/playlists', (req, res) => res.render('playlists'));
router.get('/create', (req, res) => res.render('create'));
router.post('/playlist', createPlaylist);
router.delete('/playlist', deletePlaylist);
router.get('/layout', getLayout);
router.get('/layouts', getPlaylists);

module.exports = router;
