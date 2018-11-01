const express = require('express')
var bodyParser = require('body-parser')
const path = require('path') 
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('./config');
var cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 5000

var connection = mysql.createConnection({
  host     : 'us-cdbr-iron-east-01.cleardb.net',
  user     : 'be8d4b7db7f071',
  password : 'c8c05406',
  database : 'heroku_632ec98e3d07310'
});
 
connection.connect();

var app = express();


app.use(express.static(path.join(__dirname, 'public')))
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

app.get('/rest/markers/', async (req, res) => { 
	if(req.query.query == undefined) {
		connection.query("SELECT * FROM `Markers`", function (error, results, fields) {
			if(error) {console.log(error); return}
			res.send(JSON.stringify(results));
		});	
	} else {
		var queryString = "SELECT * FROM `Markers` WHERE email = 1";
		for(var word of req.query.query.split(' ')) {
			queryString = queryString + 	  
				" OR name LIKE '%" + word + "%'" + 
				" OR product LIKE '%" + word + "%'" + 
				" OR email LIKE '%" + word + "%'" + 
				" OR address LIKE '%" + word + "%'" + 
				" OR tags LIKE '%" + word + "%' ";
		}
		connection.query(queryString, function (error, results, fields) {
			if(error) {console.log(error); return}
			res.send(JSON.stringify(results));
		});	
	}
}); 

app.get('/rest/markers/product/:prd', (req, res) => { 
	connection.query("SELECT * FROM `Markers` WHERE product = '" + req.params.prd.toLowerCase() + "'", function (error, results, fields) {
		if(error) {console.log(error); return}
		res.send(JSON.stringify(results));
		});
});

app.get('/rest/markers/id/:idno', (req, res) => { 
	connection.query("SELECT * FROM `Markers` WHERE id = " + req.params.idno, function (error, results, fields) {
		if(error) {console.log(error); return}
		res.send(JSON.stringify(results));
		});
});

app.get('/rest/markers/latlong/', (req, res) => { 
	connection.query("SELECT * FROM `Markers` WHERE latitude = " + req.query.lat + "AND longitude = " + req.query.long, function (error, results, fields) {
		if(error) {console.log(error); return}
		res.send(JSON.stringify(results));
		});
});

app.get('/', (req, res) => { 
	res.render('pages/index'); 
}); 

app.post('/rest/markers/', function (req, res) {
	var data = req.body;
	var token = req.headers['x-access-token'];
	
	jwt.verify(token, config.secret, function(err, decoded) {
		if (err) return res.status(401).send({auth : false, message: 'Unauthorised!'});
			connection.query(
				'INSERT INTO `Markers` (latitude, longitude, product, version, name, email, address, website, patients, country, ' +
				'tags, description, key) VALUES (' + data.latitude + ', ' + data.longitude + ', "' + data.product + '", ' + data.version + ', "' + data.name + '", "' + data.email + '", "' + data.address + '", "' + data.website + '", ' + data.patients + ', "' + data.country + '", "' + data.tags + '", "' + data.description + '", "' + data.key + '")', 
				function(error, results, fields) {
					if(error) {console.log(error); return res.status(500).send({message : 'Internal server error'});}
					res.send({result : "Successful"});
				});	
		});	
});

app.get('/auth/keys/create/:id', function (req, res) {
	var token = req.headers['x-access-token'];
	if (!token) return res.status(401).send({auth : false, message : 'No authorisation token provided!'});
  
	jwt.verify(token, config.secret, function(err, decoded) {
		if (err) return res.status(401).send({auth : false, message: 'Unauthorised!'});
		if(!decoded.user == "super") { return res.status(401).send({auth : false, message: 'Unauthorised!'});}
		connection.query('SELECT * FROM `Markers` WHERE id = ' + req.params.id, function(error, results, fields) {
			if(error) return res.status(500).send({auth: false, message: 'Server error'});
			var token = jwt.sign(results, config.secret, {});
			connection.query('UPDATE `Markers` SET key = "' + token + '" WHERE id = ' + req.params.id, function(error, results, fields) {
				if(error) return res.status(500).send({auth: false, message: 'Server error'});
				return res.status(200).send({auth : true, token : token});
			});
		});
  });
});

app.get('/auth/keys/remove', function (req, res) {
	var token = req.headers['x-access-token'];
	if (!token) return res.status(401).send({auth : false, message : 'No authorisation token provided!'});
  
	jwt.verify(token, config.secret, function(err, decoded) {
		if (err) return res.status(401).send({auth : false, message: 'Unauthorised!'});
		connection.query('UPDATE `Users` SET apikey = NULL WHERE email = "' + decoded.id + '"', function(error, results, fields) {
			if(error) return res.status(500).send({auth: false, message: 'Server error'});
			return res.status(200).send({auth : true, token : null, message : 'Successful!'})
		});
  });
});


app.get('/admin', function(req, res) {
  res.render('pages/admin'); 
});

setInterval(function () {
	connection.query("SELECT 1", function (error, results, fields) {
		;
	});
}, 5000);