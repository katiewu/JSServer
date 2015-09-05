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
var Task;

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

  var taskSchema = mongoose.Schema({
    username: String,
    timestamp: String,
    location: [Number],
    description: String,
    price: Number,
    status: String
  });
  
  User = mongoose.model('users', userSchema);
  Task = mongoose.model('tasks', taskSchema);

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
  login: login,
  register: register,
  sendtask: sendTask,
  receivetask: receiveTask,
  updatetasklist: updateTaskList
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function login(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
   var phonenumber = req.query.phonenumber;
   var password = req.query.password;

   User.find({phonenumber: phonenumber}, function(err, users){
       if(users == undefined || users == null || users.length == 0){
           var error_res = {"status": "false"};
           res.json(error_res);
       }
       else {
           var user = users[0];
           var pnumber = user.phonenumber;
           var pwd = user.password;
           if (password != pwd) {
               var pwderr_res = {"status": "false"};
               res.json(pwderr_res);
           }
           else {
               var username = user.username;
               var venmoid = user.venmoid;
               var json_res = {
                   "status": "true",
                   "username": username,
                   "phonenumber": phonenumber,
                   "password": password,
                   "venmoid": venmoid
               };
               res.json(json_res);
           }
       }

   });

}

function register(req, res){
    var phonenumber = req.query.phonenumber;
    var password = req.query.password;
    var username = req.query.username;
    var venmoid = req.query.venmoid;

    var user = new User({
        phonenumber: phonenumber,
        password: password,
        username: username,
        venmoid: venmoid
    });

    user.save();
    var json_res = {"registerResult": "successful"};
    res.json(json_res);
}

function sendTask(req, res){
    var username = req.query.username;
    var timestamp = req.query.timestamp;
    var location = req.query.location;
    var description = req.query.description;
    var price = req.query.price;
    var receiver = req.query.receiver;
    var status = "Unprocessed";

    var task = new Task({
        username: username,
        timestamp: timestamp,
        location: location,
        description: description,
        price: price,
        status: status,
        receiver: receiver
    });

    task.save();

}

function updateTaskList(req, res){
    Task.find({}, function(err, tasks){
        if(!err){
            var task_list = tasks;
            res.json(task_list);
        }
    });
}

function receiveTask(req, res){
    var phonenumber = req.query.phonenumber;
    var timestamp = req.query.timestamp;
    var username = req.query.username;

    Task.find({phonenumber: phonenumber, timestamp: timestamp}, function(err, users){

    });
}
