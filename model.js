/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Schema definitions.
 */

var tokenSchema = new Schema({
  accessToken: { type: String },
  accessTokenExpiresAt: { type: Date },
  client : { type: Object },  // `client` and `user` are required in multiple places, for example `getAccessToken()`
  clientId: { type: String },
  refreshToken: { type: String },
  refreshTokenExpiresAt: { type: Date },
  user : { type: Object },
  userId: { type: String },
});

mongoose.model('OAuthTokens', tokenSchema);

var clientSchema = new Schema({
  clientId: { type: String },
  clientSecret: { type: String },
  redirectUris: { type: Array },
  grants:{type: Array}
});

mongoose.model('OAuthClients',clientSchema );

var userSchema = new Schema({
  email: { type: String, default: '' },
  firstname: { type: String },
  lastname: { type: String },
  password: { type: String },
  username: { type: String }
});
mongoose.model('OAuthUsers', userSchema);

var OAuthTokensModel = mongoose.model('OAuthTokens');
var OAuthClientsModel = mongoose.model('OAuthClients');
var OAuthUsersModel = mongoose.model('OAuthUsers');

module.exports.OAuthTokensModel = OAuthTokensModel;
module.exports.OAuthClientsModel = OAuthClientsModel;
module.exports.OAuthUsersModel = OAuthUsersModel;

/**
 * Get access token.
 */

module.exports.getAccessToken = function(bearerToken) {
  // Adding `.lean()`, as we get a mongoose wrapper object back from `findOne(...)`, and oauth2-server complains.
  return OAuthTokensModel.findOne({ accessToken: bearerToken }).lean();
};

/**
 * Get client.
 */

module.exports.getClient = function(clientId, clientSecret) {
    //return OAuthClientsModel.findOne({ clientId: clientId, clientSecret: clientSecret }).lean();
  //For google password implicit flow, no field for client secret
  return OAuthClientsModel.findOne({ clientId: clientId }).lean();    
};

/**
 * Get refresh token.
 */

module.exports.getRefreshToken = function(refreshToken) {
  return OAuthTokensModel.findOne({ refreshToken: refreshToken }).lean();
};

/**
 * Get user.
 */

module.exports.getUser = function(username, password) {
  return OAuthUsersModel.findOne({ username: username, password: password }).lean();
};

/**
 * Save token.
 */

module.exports.saveToken = function(token, client, user) {
  tokenExpiryDate = new Date( Date.now() + 50*365*24*3600*100 );
  var accessToken = new OAuthTokensModel({
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    client : client,
    clientId: client.clientId,
    refreshToken: token.refreshToken,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
    user : user,
    userId: user._id,
  });
  // Can't just chain `lean()` to `save()` as we did with `findOne()` elsewhere. Instead we use `Promise` to resolve the data.
  return new Promise( function(resolve,reject){
    accessToken.save(function(err,data){
      if( err ) reject( err );
      else resolve( data );
    }) ;
  }).then(function(saveResult){
    // `saveResult` is mongoose wrapper object, not doc itself. Calling `toJSON()` returns the doc.
    saveResult = saveResult && typeof saveResult == 'object' ? saveResult.toJSON() : saveResult;

    // Unsure what else points to `saveResult` in oauth2-server, making copy to be safe
    var data = new Object();
    for( var prop in saveResult ) data[prop] = saveResult[prop];

    // /oauth-server/lib/models/token-model.js complains if missing `client` and `user`. Creating missing properties.
    data.client = data.clientId;
    data.user = data.userId;

    return data;
  });
};
