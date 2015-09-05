'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 http://www.w3schools.com/js/js_strict.asp
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var util = require('util');
var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');

var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };

var User;

var mongodbUri = "mongodb://linjie333:123456@ds041593.mongolab.com:41593/tasker";

var mongooseUri = uriUtil.formatMongoose(mongodbUri);

mongoose.connect(mongooseUri, options);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
  
  //create user schema
  var userSchema = mongoose.Schema({
    username: String,
    password: String,
    phonenumber: String,
    venmoid: String
  });
  
  User = mongoose.model('users', userSchema);

});

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
  hello: hello
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function hello(req, res) {
    // console.log("hahahaha");
 //    console.log(res.body.phonenumber);
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  // var phonenumber = req.body.phonenumber;
  // var password = req.body.password;
   var json_res = {"message": "111"};
  // var hello = util.format('Hello, %s!', name);

  // this sends back a JSON response which is a single string
  res.json(json_res);
  // res.send("aaaaaa");
}
