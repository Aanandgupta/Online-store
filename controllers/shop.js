const Product = require("../models/product");
const Cart = require("../models/cart");
const User = require("../models/user");
const mongodb = require("mongodb");
const fs = require('fs')
const path = require('path')

const PDFDocument = require('pdfkit')


exports.getProduct = (req, res, next) => {
  // res.sendFile(path.join(rootDir, 'views', 'shop.html'))
  // console.log(adminData.products);
  // console.log("Hello");
  let currPage = req.query.page;

  if(!currPage){
    currPage = 1;
  }
  let prevPage = currPage-2;
  if(prevPage<=1)
  {
    prevPage = 2;
  }

  let nextPage = Number(currPage)+2;
  

  const ITEM_PER_PAGE = 3
  Product.countProducts().then(count=>{
    let pages = Math.ceil(count/ITEM_PER_PAGE);
    if(nextPage>pages)
    nextPage = pages;

    Product.fetchAll((currPage-1)*ITEM_PER_PAGE,ITEM_PER_PAGE).then((products) => {
      res.render("shop/index", {
        prods: products,
        docTitle: "Shop",
        url: req.url,
        isLoggedIn: req.session.isLoggedIn,
        csrfToken: req.csrfToken(),
        pages: pages,
        currPage: currPage,
        prevPage: prevPage,
        nextPage: nextPage
      });
    });
  })
  
};

exports.getProductById = (req, res, next) => {
  let prodId = req.params.productId;
  Product.fetchById(prodId)
    .then((products) => {
      res.render("shop/product-details", {
        prods: products,
        docTitle: "Product Details",
        url: req.url,
        isLoggedIn: req.session.isLoggedIn
      });
    })
    .catch((err) => console.log(err));
};

exports.postOrders = (req, res, next) => {
  Product.fetchAll().then((result) => {
    allProducts = [...result];
    allProductsDict = {};
    index = 0;
    for (let j of allProducts) {
      let id = j._id.toString();
      allProductsDict[id] = index;
      index += 1;
    }
    const orders = [...req.session.user.orders];
    let serialNo = (orders.length + 1)
    
    const newOrder = []
    let totalPrice = 0;
    User.fetchFromCart(req.session.user._id).then((result) => {
      const tempCart = [...result.cart];
      for (let i of tempCart) {
        let ind = allProductsDict[i.product.toString()];
        let reqProduct = allProducts[ind];
        totalPrice+=(i.qty)*(reqProduct.price);
        newOrder.push({
          prodId: new mongodb.ObjectID(i.product),
          title: reqProduct.title,
          price: reqProduct.price,
          qty: i.qty,
        });
      }
      const _id = req.session.user._id.toString() + serialNo;
        orders.push({products: newOrder, totalPrice: totalPrice, id: _id})
      User.updateOrders(req.session.user._id, orders)
        .then((result) => {
          User.fetchById(req.session.user._id).then((result) => {
            req.session.user = result;

            res.redirect('/order');
          });
        })
        .catch((err) => {
          console.log(err);
          // next();
        });
      
    });

  
  });
};

exports.getOrders = (req, res, next) => {

  const orders = [...req.session.user.orders];
  res.render("shop/orders", {
    docTitle: "My Orders",
    orders: orders,
    url: req.url,
    isLoggedIn: req.session.isLoggedIn
  });
};
exports.getShopProducts = (req, res, next) => {
  // res.sendFile(path.join(rootDir, 'views', 'shop.html'))
  // console.log(adminData.products);
  let currPage = req.query.page;

  if(!currPage){
    currPage = 1;
  }
  let prevPage = currPage-2;
  if(prevPage<=1)
  {
    prevPage = 2;
  }

  let nextPage = Number(currPage)+2;
  

  const ITEM_PER_PAGE = 3
  Product.countProducts().then(count=>{
    let pages = Math.ceil(count/ITEM_PER_PAGE);
    if(nextPage>pages)
    nextPage = pages;

    Product.fetchAll((currPage-1)*ITEM_PER_PAGE,ITEM_PER_PAGE).then((products) => {
      res.render("shop/product-list.ejs", {
        prods: products,
        docTitle: "Products",
        url: req.url,
        isLoggedIn: req.session.isLoggedIn,
        csrfToken: req.csrfToken(),
        pages: pages,
        currPage: currPage,
        prevPage: prevPage,
        nextPage: nextPage
      });
    });
  })
  
};

exports.getCart = (req, res, next) => {
  const prods = [];
  let totalPrice = 0;
  let allProducts = [];
  Product.fetchAll().then((result) => {
    allProducts = [...result];
   
    allProductsDict = {};
    index = 0;
    for (let j of allProducts) {
      let id = j._id.toString();
      allProductsDict[id] = index;
      index += 1;
    }
  
    User.fetchFromCart(req.session.user._id).then((cartItems) => {
      const cartProducts = [];
      for (let p of cartItems.cart) {
        let qty = p.qty;
        p = p.product.toString();
    
        let ind = allProductsDict[p];

        if (ind != undefined) {
          let reqProduct = allProducts[ind];
          totalPrice += reqProduct.price * qty;
          cartProducts.push({
            title: reqProduct.title,
            price: reqProduct.price,
            qty: qty,
            id: p,
          });
        } else {
          User.deleteFromCart(req.session.user._id, p, true);
        }
      }
      res.render("shop/cart.ejs", {
        prods: cartProducts,
        totalPrice: totalPrice,
        docTitle: "Cart",
        url: req.url,
        isLoggedIn: req.session.isLoggedIn
      });
    }).catch(err=>{
      console.log(err);
    });
  });
  // console.log(allProducts);
};

exports.postDeleteCart = (req, res, next) => {
  let prodId = req.body.prodId;
  // console.log("Post Delete Cart",prodId);
  User.deleteFromCart(req.session.user._id, prodId).then((result) =>
    res.redirect("/cart")
  );
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  const currPage = req.body.currPage;
  // console.log(prodId);
  Product.fetchById(prodId)
    .then((product) => {
      // let productPrice = product[0].price;
      // console.log(req.session.user);
      return User.addToCart(product, req.session.user._id);
    })
    .then((result) => {
      // console.log("hello");
      res.redirect("/?page="+currPage);
    })
    .catch((err) => console.log(err));
};


exports.getInvoice = (req, res, next)=>{
  const orderId = req.params.orderId;
  const invoiceName = 'Invoice-' + orderId + '.pdf';
  const invoicePath = path.join('data', 'invoices', invoiceName);

  const pdfDoc = new PDFDocument();

  if(orderId.slice(0, 24) == req.session.user._id)
  // if(true)
      {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename = "' + invoiceName + '"');
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        pdfDoc.fontSize(26).text('Invoice',{
          underline: true
        });

        pdfDoc.text('-------------------------------------');
        const reqOrder = req.session.user.orders.find(p=>p.id == orderId)
        for(let i of reqOrder.products)
        {
          pdfDoc.fontSize(16).text(i.title + ' * ' + i.qty);
          // const width = pdfDoc.widthOfString(i.title);
          // const height = pdfDoc.currentLineHeight();
          // pdfDoc.underline(20, 0, width, height);
        }

        pdfDoc.fontSize(23).text("Amount Paid = $" + reqOrder.totalPrice);

        pdfDoc.end();

        // file.pipe(res);
      }
      else{
        console.log("Unauthorised Access");
        res.redirect('/login');
      }
  
  // const file = fs.createReadStream(invoicePath)
}
// console.log(req.body);
