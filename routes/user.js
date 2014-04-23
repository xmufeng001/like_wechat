
/*
 * GET users listing.
 */
var open_api =require('../open-api.js');

exports.list = function(req, res){
    open_api.send();
  res.send("respond with a resource");
};