const express = require('express'),
    path = require('path'),
    session = require('express-session'),
    app = express(),
    port = process.env.PORT || 3001;

// SET VIEW ENGINE AND PATH //
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
// END //

// SET ASSETS AS A STATIC PATH //
app.use(express.static(path.join(__dirname, 'assets/')))
// END //

// SET REQUEST HANDLER //
app.use(express.json())
app.use(express.urlencoded({extended:false})) 
// END //

// CONFIGURE SESSION //
app.use(session({
    secret: 'ESG RISK VIEWER',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000
    }
}));
// END //

// PRE REQUEST HANDLER //
app.use((req, res, next) => {
    res.locals.user = req.session.user;
	res.locals.active = req.path.split('/')[1];
	res.locals.message = req.session.message;
    delete req.session.message;
    next();
})
const { MasterRouter } = require('./router/MasterRouter');
// END //

// IMPORT ROUTERS //
const { UserRouter } = require('./router/UserRouter');
// END //

app.get('/', (req, res) => {
    // var bcrypt = require('bcrypt')
    // var pass = '123'
    // pass = bcrypt.hashSync(pass, 10)
    // res.send(pass)
    let user = req.session.user;
    if (user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
})

app.use(UserRouter)
app.use(MasterRouter)

app.get('/dashboard', (req, res) =>{
    res.render('pages/index')
})

app.get('/user_data', (req, res) => {
    var data = {
        dt:[
            {id: 1, name: 'a'},
            {id: 2, name: 'b'},
            {id: 3, name: 'c'},
            {id: 4, name: 'd'},
            {id: 5, name: 'e'},
            {id: 6, name: 'f'},
        ]
    }
    console.log(data);
    res.send(data)
})

// LISTEN SERVER //
app.listen(port, (err) => {
    if (err) throw new Error(err)
    else console.log(`App is running at http://localhost:${port}`);
})
// END //