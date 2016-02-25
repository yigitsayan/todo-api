var express    = require('express');
var bodyParser = require('body-parser');
var _          = require('underscore');
var app        = express();
var PORT       = process.env.PORT || 3000;
var todos      = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res){
   res.send('Todo API Root');
});

app.get('/todos', function(req, res){
    res.json(todos);
});

app.get('/todos/:id', function(req, res){
    var todoID = parseInt(req.params.id);
    var matchedToDo = _.findWhere(todos, {id: todoID});

    if(matchedToDo) {
        res.json(matchedToDo);
    } else {
        res.status(404).send();
    }
});

app.post('/todos', function(req, res){
    var body = _.pick(req.body,'description','completed');

    if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return res.status(404).send();
    }

    body.description = body.description.trim();
    body.id = todoNextId;
    todoNextId++;
    todos.push(body);

    res.json(body);
});

app.delete('/todos/:id', function(req, res){
    var todoID = parseInt(req.params.id);
    var matchedToDo = _.findWhere(todos, {id: todoID});

    todos = _.without(todos,matchedToDo);

    if(matchedToDo) {
        res.json(matchedToDo);
    } else {
        res.status(404).send();
    }
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

app.listen(PORT,function(){
    console.log('Express listening on port' + PORT + '!');
});