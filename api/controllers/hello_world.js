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
    venmoid: String,
    longitude: Number,
    latitude: Number
  });

  var taskSchema = mongoose.Schema({
    phonenumber: String,
    timestamp: String,
    longitude: Number,
    latitude: Number,
    description: String,
    price: Number,
    receiver: String,
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
  updatetasklist: updateTaskList,
  updatelocation: updateLocation,
  pollinglocation: pollingLocation,
  confirmtask: confirmTask
};



var locations = {};
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
        venmoid: venmoid,
        longitude: 0,
        latitude: 0
    });

    user.save();
    var json_res = {"registerResult": "successful"};
    res.json(json_res);
}


function sendTask(req, res){
    var phonenumber = req.query.phonenumber;
    var timestamp = req.query.timestamp;
    var longitude = req.query.longitude;
    var latitude = req.query.latitude;
    var description = req.query.description;
    var price = req.query.price;
    var receiver = "null";
    var status = "unprocessed";

    console.log("Receive task");
    var task = new Task({
        phonenumber: phonenumber,
        timestamp: timestamp,
        longitude: longitude,
        latitude: latitude,
        description: description,
        price: price,
        receiver: receiver,
        status: status
    });

    task.save();

    var json_res = {"registerResult": "successful"};
    res.json(json_res);

}

function updateTaskList(req, res){
    console.log("update tasklist");
    Task.find({}, function(err, tasks){
        if(!err){
            var unprocessed_tasks = [];
            for(var i=0;i<tasks.length;i++){
                var task = tasks[i];
                if(task.status == "unprocessed"){
                    unprocessed_tasks.push(task);
                }
            }
            var task_list = {taskList: unprocessed_tasks};
            res.json(task_list);
        }
    });
}

function receiveTask(req, res){
    var phonenumber = req.query.phonenumber;
    var timestamp = req.query.timestamp;
    var receiver = req.query.receiver;

    Task.find({phonenumber: phonenumber, timestamp: timestamp}, function(err, tasks){
        if(!err){
            if(tasks == undefined || tasks == null || tasks.length == 0){
                res.json({"result": "fail"});
            }
            else{
                var task = tasks[0];
                // update task receiver, status
                Task.update({phonenumber: phonenumber, timestamp: timestamp},
                    {receiver: receiver, status: "processed"}, {multi: true}, function(err, numsAffected){
                        res.json({status: "true"});
                    });
            }
        }
    });
}

function updateLocation(req, res){
    var phonenumber = req.query.phonenumber;
    var longitude = req.query.longitude;
    var latitude = req.query.latitude;

    locations[phonenumber] = [longitude, latitude];

    User.update({phonenumber: phonenumber},
        {longitude: longitude, latitude: latitude}, {multi: true}, function(err, numsAffected){
            res.json({status: "true"});
        });
}

function pollingLocation(req, res){
    var phonenumber = req.query.phonenumber;
    var keyset = Object.keys(locations);
    var results = [];
    for(var keyindex in keyset){
        console.log(keyindex);
        var key = keyset[keyindex];
        if(key != phonenumber){
            console.log("hahahahaha");
            var location = {phonenumber: key, longitude: locations[key][0], latitude: locations[key][1]};
            results.push(location);
        }
    }
    console.log("############");
    console.log(results);
    var location_list = {locationList: results};
    console.log(location_list);
    res.json(location_list);

    //User.find({}, function(err, users){
    //    if(!err){
    //        var locations = [];
    //        for(var i=0;i<users.length;i++){
    //            var user = users[i];
    //            if(user.phonenumber != phonenumber && (user.longitude != 0 || user.latitude != 0)){
    //                var location = {phonenumber: user.phonenumber, longitude: user.longitude, latitude: user.latitude};
    //                locations.push(location);
    //            }
    //        }
    //        var location_list = {locationList: locations};
    //        res.json(location_list);
    //    }
    //});
}

function confirmTask(req, res){
    var phonenumber = req.query.phonenumber;
    var timestamp = req.query.timestamp;

    Task.find({phonenumber: phonenumber, timestamp: timestamp}, function(err, tasks){
        if(!err){
            var task = tasks[0];
            Task.update({phonenumber: phonenumber, timestamp: timestamp},
                {status: "finished"}, {mutli: true}, function(err, numsAffected){
                    res.json({status: "true"});
                })
        }
    });

}
