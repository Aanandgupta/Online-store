const express = require('express');
const app = express();
const path = require('path')
const router = express.Router();
const rootDir = require('../util/path')
const errorController = require('../controllers/404')
router.use('/', errorController.getErrorPage)

module.exports = router;