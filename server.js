var express = require('express');
var app = express();
var _ = require('underscore');
var parser = require('body-parser');
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(parser.json());
//GET /todos
app.get('/todos', function(req, res){
	res.json(todos);
});


//GET /todos/:id
app.get('/todos/:id', function(req, res){

	
	var id = parseInt(req.params.id, 10);
	var todoItem = _.findWhere(todos, { id : id});

	if(!todoItem){
		res.status(404).send();
	}else{
		res.json(todoItem);
	}
	
});

app.post('/todos', function(req, res){
	var body = _.pick(req.body, 'description', 'complete');
	
	if(!_.isBoolean(body.complete) || !_.isString(body.description) || body.description.trim().length === 0){

		return res.status(400).send();
	}

	body.description = body.description.trim();
	
	body.id = todoNextId;//sets id
	todoNextId++;//increments id
	todos.push(body);//pushes todo item onto list
	
	res.json(body);
});

app.get('/', function(req, res){
	res.send('Todo API Rest End Point');
});

app.listen(PORT, function(){
	console.log('Listening on port ' + PORT);
});