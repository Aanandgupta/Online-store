const http = require("http");
// const ReqHandler = require('./routes(Vanilla Node Logic)'); This was Vanilla Node Logic for returning responses.
const express = require("express");
const path = require("path");
const app = express();
const db = require("./util/database");
const User = require("./models/user");
const session = require("express-session");
const bodyParser = require("body-parser");

const flash = require("connect-flash");
const csrf = require("csurf");
const multer = require("multer");
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/");
  },
  filename: (req, file, cb) => {
    let fileName = new Date().toISOString();
    let temp = "";
    for (let i of fileName) {
      if (i != ":") temp = temp + i;
    }

    fileName = temp;
    fileName = fileName + "-" + file.originalname;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const mongoDbStore = require("connect-mongodb-session")(session);
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorRoutes = require("./routes/error");
const authRoutes = require("./routes/auth");
// const mongoConnect = require('./util/database');
// db.execute('SELECT * FROM products').then(
//     result=>{
//         console.log(result);
//     }
// ).catch(
//     err=>{
//         console.log(err);
//     }
// );

const csrfProtection = csrf();


app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    cookie: { expires: new Date(253402300000000), maxAge: new Date(253402300000000) },
  })
);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single("image")
);
app.use(csrfProtection);
app.use(flash());

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/admin/images", express.static(path.join(__dirname, "images")));
// app.use(session({}))
app.use("/admin", adminRoutes.router);

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  if (req.session.user) res.locals.userName = req.session.user.name;

  next();
});
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorRoutes);

//   console.log("In The MiddleWare");
//   next(); // This Allows the request to travel in the next middleware.
// });

// app.use((req, res, next) => {
//   console.log("In Another MiddleWare");
//   res.send("<h1>Hello From Express</h1>");
// });

const server = http.createServer(app);

// const server=http.createServer((req, res)=>{

//     ReqHandler(req, res); Raw Logic Function Call

//     process.exit()
//     {
//         Process.exit is a function that will end the event Loop. Event Loop is a concept where the node server will keep on listenting to the events continuously. Once There is an incoming Request the anonymous func inside http.createServer will invoke.
//     }

// });

db.mongoConnect(() => {
  server.listen(3000);
  // console.log(client)
});
