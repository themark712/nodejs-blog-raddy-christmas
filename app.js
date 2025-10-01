require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routeHelpers');

const app = express();
const PORT = 3000 || process.env.PORT;

// connect to db
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use('/tinymce', express.static(path.join(__dirname, 'js', 'tinymce')));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  })
  // cookie : { maxAge: new Date ( Date.now() + (3600000) )}
}));


app.use(express.static('public'));

// Templating engine
app.use(expressLayout);

app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

const mainRoute = require('./server/routes/main');
app.use('/', mainRoute);

const adminRoute = require('./server/routes/admin');
app.use('/', adminRoute);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
}); 
