var express = require('express');

var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : '[cs290_hernarey]',
  password        : '[3114]',
  database        : '[cs290_hernarey]'
});

module.exports.pool = pool;


var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3430);


//This sets up the body parser for reading the request body
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/',function(req,res){
    var qParams = [];
    for (var p in req.query){
        qParams.push({'name':p, 'value':req.query[p]})
    }
    var context = {};
    context.dataSent = qParams;
    res.render('getPage.handlebars',context)
});

//by visiting this page, the table is reset
app.get('/reset-table',function(req,res,next){
  var context = {};
  pool.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});


//This is for parsing the body in a POST request. It will handle either URLEncoded or JSON
app.post('/', function(req,res){
    var otherParams = [];
    for (var o in req.query){
        otherParams.push({'name':o, 'value':req.query[o]})
    }


    var qParams = [];
    for (var p in req.body){
      qParams.push({'name':p,'value':req.body[p]})
    }
    

    var context = {};
    context.queryDataSent = otherParams;
    context.dataSent = qParams;
    res.render('postPage', context);
  });


app.use(function(req,res){
  res.status(404);
  res.render('404');
});


app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});


app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});