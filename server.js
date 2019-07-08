// REST-API JUST FOR FUN
var express = require('express');
var bodyParser = require('body-parser');
var uuid = require('uuid');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const uuidv1 = require('uuid/v1');

app.use(express.static('public'));

// SQLITE :
var fs = require('fs');
var dbFile = './data/database.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE News (id text primary key not null, title text not null, body text not null)');
    console.log('New table News created!');
  }
});

// FRONT END :
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// RESTFUL API :
app.get('/dosomething', function(request, response){
  response.send('ok bos')
})

app.get('/getDreams', function(request, response) {
  db.all('SELECT * from Dreams', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});

app.post('/newitem', function(request, response){
  var thedream = request.body.thedream;
  console.log('thedream', request.body)
  db.run('INSERT INTO Dreams (dream) VALUES ($thedream)',{
    $thedream: thedream
  }, function(error){
    if(error){
      response.send(404);
    } else {
      response.send({ 'msg': 'Success' });
    };
  })
})

//create new post
app.post('/post', function(request, response){
  var title = request.body.title;
  var body = request.body.body;
  var id = uuidv1();

  db.run('INSERT INTO NEWS VALUES ($id, $title, $body)', {
    $id: id,
    $title: title,
    $body: body
  }, function(error){
     if(error){
       response.send(error);
     } else {
       response.send({ 'msg': 'Success' })
     }
  })
})

// GET ALL POST
app.get('/post', function(request, response){
  db.all('SELECT id, title, body FROM News', function(error, callback){
    if(error){
      response.send(error);
    } else {
      response.send({ "post": callback });
    }
  })
})

// GET SINGLE POST
app.get('/post/:postid', function(request, response){
  var postid = request.params.postid;

  db.all('SELECT * FROM News WHERE id = ?', postid, function(error, callback){
    if(error){
      response.send(error)
    } else {
      console.log('callback', callback);
      response.send({ "post": callback})
    }
  })
})

// UPDATE SINGLE POST
app.post('/post/edit/:postid', function(request, response) {
  var postid = request.params.postid;

  db.run('UPDATE News SET title = $title, body = $body where id = $id', {
    $title: request.body.title,
    $body: request.body.body,
    $id: postid
  }, function(error){
      if(error){
        response.send(error)
      } else {
        response.send({ "msg": "Success" })
      }
  })
})
// DELETE POST
app.delete('/post/delete/:postid', function(request, response){
  var postid = request.params.postid;

  db.run('DELETE FROM News Where id = $id', {
    $id: postid
  }, function(error){
    if(error){
      response.send(error)
    } else {
      response.send({ "msg": "Success" })
    }
  })

})

// KICK START :
var listener = app.listen(3000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
