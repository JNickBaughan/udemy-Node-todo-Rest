var express = require('express');
var app = express();
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

	var todoItem;
	var id = parseInt(req.params.id, 10);
	
	for (i = 0; i < todos.length; i++) {
		
	    if(todos[i].id == id){
	    	todoItem = todos[i];
	    	break;
	    }
	}

	if(!todoItem){
		res.status(404).send();
	}else{
		res.json(todoItem);
	}
	
});

app.post('/todos', function(req, res){
	var body = req.body;
	body.id = todoNextId;//sets id
	todoNextId++;//increments id
	todos.push(body);//pushes todo item onto list
	console.dir(todos);
	res.json(body);
});

app.get('/', function(req, res){
	res.send('Todo API Rest End Point');
});

app.listen(PORT, function(){
	console.log('Listening on port ' + PORT);
});