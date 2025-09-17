const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// create, find, update, delete
router.get('', postController.view);

module.exports = router;