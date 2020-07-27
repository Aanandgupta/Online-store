const Product = require("../models/product");
const Cart = require("../models/cart");
exports.getAddProduct = (req, res, next) => {
  // res.sendFile(path.join(rootDir,'views', 'add-product.html'));
  // console.log("Entered Add");
  res.render("admin/edit-product", {
    docTitle: "Add-Product",
    url: req.url,
    edit: false,
    isLoggedIn: req.session.isLoggedIn,
    csrfToken: req.csrfToken(),
    userName: req.session.user.name,
  });
  // console.log(req.url);
};

exports.getDeleteProduct = (req, res, next) => {
  let prodId = req.params.prodId;
  Product.deleteById(prodId)
    .then((result) => {
      res.status(200).json({message: "Success!"});

    })
    .catch((err) => console.log(err));
};
exports.getEditProduct = (req, res, next) => {
  let prodId = req.params.prodId;
  Product.fetchById(prodId).then((product) =>
    res.render("admin/edit-product", {
      docTitle: "Edit-Product",
      url: req.url,
      edit: true,
      title: product.title,
      price: product.price,
      description: product.description,
      url: product.url,
      prodId: prodId,
      isLoggedIn: req.session.isLoggedIn,
      csrfToken: req.csrfToken(),
      userName: req.session.user.name,
    })
  );
};

exports.postEditProduct = (req, res, next) => {
  const updatedProd = req.body;
  const prodId = req.params.prodId;
  const image = req.file;

  if (!image) {
    Product.changeById(
      prodId,
      updatedProd.title,
      updatedProd.price,
      updatedProd.oldUrl,
      updatedProd.description
    ).then((result) => {
      res.redirect("/admin/products");
    });
  } else {
    let url = "/" + image.path;
    Product.changeById(
      prodId,
      updatedProd.title,
      updatedProd.price,
      url,
      updatedProd.description
    ).then((result) => {
      res.redirect("/admin/products");
    });
  }
};

exports.getAdminProducts = (req, res, next) => {
  // res.sendFile(path.join(rootDir,'views', 'add-product.html'));
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
      res.render("admin/products.ejs", {
        prods: products,
        docTitle: "Products",
        url: '/admin/products',
        isLoggedIn: req.session.isLoggedIn,
        csrfToken: req.csrfToken(),
        userName:req.session.user.name,
        pages: pages,
        currPage: currPage,
        prevPage: prevPage,
        nextPage: nextPage
      });
    });
  })

  // console.log(req.url);
};
exports.postAddProduct = (req, res, next) => {
  let title = req.body.title;
  let price = req.body.price;
  let description = req.body.description;
  let image = req.file;
  let url = "/" + image.path;

  if (!image) {
    return res.render("admin/edit-product.ejs", {
      docTitle: "Add Product",
      url: "/add-product",
      edit: false,
      isLoggedIn: req.session.isLoggedIn,
      csrfToken: req.csrfToken(),
      userName: req.session.user.name,
    });
  }
  // console.log("Print Something",url);
  const products = new Product(
    title,
    price,
    url,
    description,
    req.session.user._id
  );
  products
    .save()
    .then((result) => {
      res.redirect("/admin/add-product");
    })
    .catch((err) => console.log(err));
};
