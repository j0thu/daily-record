const express = require('express'); //EXPRESS
const dotenv = require('dotenv'); //DOTENV
const path = require('path'); //PATH
const mongoose = require('mongoose'); //MONGOOSE
const session = require('express-session'); //EXPRESS SESSION
const passport = require('passport'); //PASSPORT
const connectDB = require('./config/db'); //MONGOOSE config
const morgan = require('morgan'); //MORGAN - for login
const MongoStore = require('connect-mongo')(session);
const methodOverride = require('method-override');
dotenv.config({ path : './config/config.env'}); //LOAD CONFIG
require('./config/passport')(passport); //passing it as an argument

const app = express(); //Express
app.use(express.urlencoded({extended:false})); //BodyParser
app.use(express.json()); // Accepting Json data
app.use(session({ //Express Session
    secret: 'secret',
    resave:false,
    saveUninitialized:false, 
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));
//Passport middleware
app.use(passport.initialize());  
app.use(passport.session());

//Set Global variable -> this will enable us to use user from within our template(eg: editIcon)
app.use(function(req, res, next){
    res.locals.user=req.user || null  // null if it does not exist
    next();
})
connectDB(); //Connecting to Database

const exphbs = require('express-handlebars'); //HANDLEBARS

app.use(express.static(path.join(__dirname, 'public'))); //STATIC FOLDERS

//Method override docs
app.use(methodOverride(function(req, res){
    if(req.body && typeof req.body ==='object' && '_method' in req.body){
        //Look in URL encoded POST bodies and delete it 
        let method = req.body._method
        delete req.body._method
        return method
    }
}))
//Importing Routes
const indexRoute = require('./routes/index');
const authRoute = require('./routes/auth');
const storiesRoute = require('./routes/stories');
//Logging
if(process.env.NODE_ENV ==='development'){
    app.use(morgan('dev'));
}
// Handlebar helpers
const {formatDate, stripTags, truncate, editIcon, select} = require('./helpers/hbs');
//Handlebars
app.engine('.hbs',exphbs({helpers: {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select
},
defaultLayout:'main',
extname:'.hbs'}));
app.set('view engine', '.hbs');

//Routes
app.use('/', indexRoute);
app.use('/auth', authRoute);
app.use('/stories', storiesRoute);




//SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server is running in ${process.env.NODE_ENV} mode on PORT ${PORT}`));