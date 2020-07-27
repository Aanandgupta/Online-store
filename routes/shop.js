const express = require("express");
const app = express();
const path = require('path');
const router = express.Router();
const rootDir = require('../util/path')

const Protect = require('../protection')
const shopController = require('../controllers/shop')
const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({extended: false}))
router.get("/", shopController.getProduct);

router.post("/cart",Protect ,shopController.postCart);

router.post("/cart-delete", Protect ,shopController.postDeleteCart);

router.get("/cart",Protect , shopController.getCart);

router.get("/products", shopController.getShopProducts)

router.get("/products/:productId", shopController.getProductById)

router.post("/order", Protect ,shopController.postOrders);

router.get("/order", Protect ,shopController.getOrders);

router.get("/order/:orderId", shopController.getInvoice);

module.exports = router;