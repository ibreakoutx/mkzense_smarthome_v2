var mongoose = require('mongoose');

var model =require('./model');

var initdbAsync = async function(uri) {
  try {
    await mongoose.connect(uri);

    var client = new model.OAuthClientsModel( { clientId:'abcd', clientSecret:'1234',grants:['password']});
    await client.save();

    var user = new model.OAuthUsersModel( {username:'rick', password:'oldman'});
    await user.save();

    process.exit();
  }
  catch(err) {
    console.log(new Error(err));
  }
}

var initdb = function(uri) {
  initdbAsync(uri);
}

initdb('mongodb://mkzense:mkzensemongo@localhost:27017/test');

