'use strict'

// Require Dependencies
const 
      express = require('express'),
      ejs = require('ejs');


var uploadFunctions = require('./upload');
// Init app
const app = express();

// EJS
app.set('view engine', 'ejs');

// Express Middleware
// Public Folder for serving static files
app.use(express.static('./public'));


// Routes 
// main route
app.get('/', (req, res) => res.render('index'));

// upload route
app.post('/upload', uploadFunctions.uploadAPIhandler);




// Express Error Handling
app.use(function(err, req, res, next) {
    // if(!err) return next(); 
    console.log("Please have a look at this " + err);
    res.render('index', {
      msg: err
    });
});

const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));