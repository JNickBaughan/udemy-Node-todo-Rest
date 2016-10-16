var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [
	{
		id: 1
		,description: 'Go to grocery store'
		,complete: false
	}
	,{
		id: 2
		,description: 'Fix gutters'
		,complete: false
	}
	,{
		id: 3
		,description: 'Fix floor'
		,complete: true
	}
];

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

app.get('/', function(req, res){
	res.send('Todo API Rest');
});

app.listen(PORT, function(){
	console.log('Listening on port ' + PORT);
});