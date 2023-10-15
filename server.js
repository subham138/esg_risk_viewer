const express = require("express"),
  path = require("path"),
  session = require("express-session"),
  app = express(),
  port = process.env.PORT || 3000,
  https = require('https'),
  fs = require('fs');

// SET VIEW ENGINE AND PATH //
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// END //

// SET ASSETS AS A STATIC PATH //
app.use(express.static(path.join(__dirname, "assets/")));
// END //

// SET REQUEST HANDLER //
// app.use(express.json()); //
// app.use(express.urlencoded({ extended: false }));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: false}));
// END //

// CONFIGURE SESSION //
app.use(
  session({
    secret: "ESG RISK VIEWER",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000,
    },
  })
);
// END //

const options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl/private-key.txt')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl/esgriskviewer.crt')),
  /*ca: [
      fs.readFileSync(path.join(__dirname, 'ssl_credential/DigiCertCA.crt')),
      fs.readFileSync(path.join(__dirname, 'ssl_credential/My_CA_Bundle.crt'))
  ]*/
};

var server = https.createServer(options, app);

// PRE REQUEST HANDLER //
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.active = req.path.split("/")[1];
  res.locals.message = req.session.message;
  res.locals.videoPopUp = req.session.videoPopUp ? (req.session.user ? (req.session.user.user_type != 'S' ? req.session.videoPopUp : false) : req.session.videoPopUp) : false
  delete req.session.message;
  delete req.session.videoPopUp;
  // console.log(res.locals.videoPopUp, req.path);
  // console.log(req.path);
  // if(req.path != '/' && req.path != '/login'){
  //   if(!req.session.user){
  //     res.redirect('/login')
  //   }
  // }
  next();
});
// END //

// IMPORT ROUTERS //
const { UserRouter } = require("./router/UserRouter");
const { DataCollectionRouter } = require("./router/DataCollectionRouter");
const { MasterRouter } = require("./router/MasterRouter");
const { SubsRouter } = require("./router/SubscriptionRouter");
const { ProjectRouter } = require("./router/ProjectsRouter");
const { DashboardRouter } = require("./router/DashboardRouter");
// END //

app.get("/", (req, res) => {
  // var bcrypt = require('bcrypt')
  // var pass = '123'
  // pass = bcrypt.hashSync(pass, 10)
  // res.send(pass)
  let user = req.session.user;
  if (user) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

app.use(UserRouter);
app.use(MasterRouter);
app.use(DataCollectionRouter)
app.use(SubsRouter)
app.use(ProjectRouter)
app.use(DashboardRouter)

app.get("/user_data", (req, res) => {
  var data = {
    dt: [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 3, name: "c" },
      { id: 4, name: "d" },
      { id: 5, name: "e" },
      { id: 6, name: "f" },
    ],
  };
  // console.log(data);
  res.send(data);
});

/* // LISTEN SERVER //
app.listen(port, (err) => {
  if (err) throw new Error(err);
  else console.log(`App is running at http://localhost:${port}`);
});
// END //
*/
server.listen(port, (err) => {
  if (err) throw new Error(err);
  else console.log(`App is running at https://localhost:${port}`);
});