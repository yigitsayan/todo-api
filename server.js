var express    = require('express');
var bodyParser = require('body-parser');
var _          = require('underscore');
var db         = require('./db.js');
var app        = express();
var PORT       = process.env.PORT || 3000;
var todos      = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res){
   res.send('Todo API Root');
});

app.get('/todos', function(req, res){
    var query = req.query;
    var where = {};

    if(query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if(query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if(query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%'+ query.q + '%'
        }
    }

    db.todo.findAll({
        where: where
    }).then(function(todos) {
       res.json(todos);
    }, function(e) {
        res.status(500).send();
    });
});

app.get('/todos/:id', function(req, res){
    var todoID = parseInt(req.params.id);

    db.todo.findById(todoID).then(function(todo) {
       if(!!todo) {
           res.json(todo.toJSON());
       }else {
           res.status(404).send();
       }
    }, function(e) {
        res.status(500).send();
    });
});

app.post('/todos', function(req, res){
    var body = _.pick(req.body,'description','completed');

    db.todo.create(body).then(function(todo) {
       res.json(todo.toJSON());
    }, function(e) {
        res.status(400).json(e);
    });
});

app.delete('/todos/:id', function(req, res){
    var todoID = parseInt(req.params.id);

    db.todo.destroy({
        where: {
            id: todoID
        }
    }).then(function(rowsDeleted) {
       if(rowsDeleted === 0) {
            res.status(404).json({
                error: 'No todo with id'
            });
       } else {
           res.status(200).send();
       }
    },function(e) {
        res.status(500).send();
    });
});

app.put('/todos/:id', function(req, res){
    var body            = _.pick(req.body, 'description', 'completed');
    var todoID          = parseInt(req.params.id);
    var matchedToDo     = _.findWhere(todos, {id: todoID});
    var validAttributes = {};

    if(!matchedToDo) {
        return res.status(404).send();
    }

    if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if(body.hasOwnProperty('completed')){
        res.status(404).send();
    }

    if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if(body.hasOwnProperty('description')) {
        res.status(404).send();
    }

    _.extend(matchedToDo, validAttributes);
    res.json(matchedToDo);
});

db.sequelize.sync().then(function() {
    app.listen(PORT,function(){
        console.log('Express listening on port' + PORT + '!');
    });
});