var express = require('express');
var app = express();
var _ = require('underscore');
var parser = require('body-parser');
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(parser.json());

//GET /todos ?complete=true
app.get('/todos', function(req, res){

	var queryParameters = req.query;
	var filteredTodos = todos;

	//if user passed in a complete filter
	if(queryParameters.hasOwnProperty("complete") ){
		filteredTodos = _.filter(filteredTodos, function(todo){
			return todo.complete.toString() === queryParameters.complete;
		});

	}

	//if user passed in a description
	if(queryParameters.hasOwnProperty("description") && queryParameters.description.length > 0){
		filteredTodos = _.filter(filteredTodos, function(todo){
			return todo.description.toLowerCase().indexOf(queryParameters.description.toLowerCase()) > -1;
		})
	}

	res.json(filteredTodos);
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

//POST /todos
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


//PUT /todos/:id
app.put('/todos/:id', function(req, res){

	var newTodo = _.pick(req.body, 'description', 'complete');
	
	if(newTodo.hasOwnProperty('complete') && !_.isBoolean(newTodo.complete)){
		res.status(400).send("The complete field needs to be a bool");
	}
	
	if(newTodo.hasOwnProperty('description') && (!_.isString(newTodo.description) || !newTodo.description.trim().length > 0)){
		res.status(400).send("The description field needs to be a string");
	}

	var id = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, { id : id});

	if(!matchedTodo){
		res.status(404).send("hmm? Looks like that item doesn't exist");
	}

	_.extend(matchedTodo, newTodo);
	res.json(newTodo);
	

});

//DELETE /todos/:id
app.delete('/todos/:id', function(req, res){

	var id = parseInt(req.params.id, 10);
	console.log(id)
	var todoItem = _.findWhere(todos, { id : id});
	console.dir(todoItem);
	if(todoItem){
		todos = _.without(todos, todoItem);
		res.json(todoItem);
	}else{
		res.status(404).send("hmm? Looks like that item doesn't exist");	
	}

});


app.get('/', function(req, res){
	res.send('Todo API Rest End Point');
});

app.listen(PORT, function(){
	console.log('Listening on port ' + PORT);
});