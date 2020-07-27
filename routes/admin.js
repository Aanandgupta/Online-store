const express = require("express");
const app = express();
const path = require('path');
const bodyParser = require("body-parser");
const Protect = require('../protection');
const adminController = require('../controllers/admin')
const rootDir = require('../util/path')
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));

router.get("/add-product",Protect ,adminController.getAddProduct);

router.post("/add-product",Protect ,adminController.postAddProduct);

router.get("/edit-product/:prodId", Protect ,adminController.getEditProduct);

router.post("/edit-product/:prodId",Protect , adminController.postEditProduct);

router.get("/delete/:prodId", Protect, adminController.getDeleteProduct);

router.get("/products",Protect , adminController.getAdminProducts);
exports.router = router;

