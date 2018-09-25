var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', (req,res) => {
   var redirect_uri = req.query.redirect_uri;
   console.log("req.query.redirect_uri=" + redirect_uri);
   var state = req.query.state ;
   console.log("query req.query.sate =" + state);
   res.render("login.html",{redirect_uri:redirect_uri,state:state});
});

module.exports = router;
