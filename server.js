const express = require('express');
const cors = require('cors')
const app = express();
const path = require('path');
const port = process.env.PORT || 8080;
const morgan = require('morgan');
const bodyParser = require('body-parser');
const ngrok = require('ngrok');

app.use(cors());
app.use(function(req,res,next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
 });
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public/')));
app.set('view engine', 'ejs');

require('./config/database');
require('./router/route')(app);
(async function() {
	const url = await ngrok.connect(8080);
	console.log("==== print url of the ngrok====", url);
  })();

app.listen(port,function(){
	console.log('This is working port ' + port);
});
