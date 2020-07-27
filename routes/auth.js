const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth')

const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({extended: false}));

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);
router.get('/reset/:token', authController.getNewPassword);

router.post('/update', authController.postUpdate);

router.post('/reset', authController.postReset);


module.exports = router;