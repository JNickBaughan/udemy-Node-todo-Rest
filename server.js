var express = require('express');
var app = express();
var _ = require('underscore');
var db = require('./db.js');
var middleware = require('./middleware.js')(db);


var parser = require('body-parser');
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(parser.json());

//GET /todos ?complete=true
app.get('/todos', middleware.requireAuthentication, function(req, res) {

	var query = req.query;
	var where = {};

	//if user passed in a complete filter
	if (query.hasOwnProperty("complete") && query.complete.toString() === 'true') {
		where.complete = true;
	} else if (query.hasOwnProperty("complete") && query.complete.toString() === 'false') {
		where.complete = false;
	}

	if (query.hasOwnProperty("description") && query.description.length > 0) {
		where.description = {
			$like: '%' + query.description + '%'
		};
	}

	where.userId = req.user.get('id');

	db.todo.findAll({
		where: where
	}).then(function(todoItems) {
		if (todoItems) {
			res.json(todoItems);
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});


});

//GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {

	var id = parseInt(req.params.id, 10);
	var where = {};

	where.userId = req.user.get('id');
	where.id = id;

	db.todo.findOne({
		where: where
	}).then(function(todoItems) {
		if (todoItems) {
			res.json(todoItems);
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});

});

//POST /todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {

	var body = _.pick(req.body, 'description', 'complete');

	if (body.description && typeof body.description === 'string') {
		body.description = body.description.trim();
	}


	db.todo.create(body).then(function(todo) {
		req.user.addTodo(todo).then(function(){
			return todo.reload();
		}).then(function(todo){
			res.json(todo.toJSON());
		});


	}, function(e) {
		res.status(400).json(e);
	});

});


//PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {

	var id = parseInt(req.params.id, 10);
	var updatedTodo = _.pick(req.body, 'description', 'complete');
	var validTodo = {};
	var where = {};

	where.userId = req.user.get('id');

	where.id = id;


	if (updatedTodo.hasOwnProperty('complete')) {
		validTodo.complete = updatedTodo.complete;
	}

	if (updatedTodo.hasOwnProperty('description')) {
		validTodo.description = updatedTodo.description.trim();
	}

	var id = parseInt(req.params.id, 10);
	var where = {};

	where.userId = req.user.get('id');
	where.id = id;

	db.todo.findOne({
		where: where
	}).then(function(todoItem) {
		if (todoItem) {
			
			todoItem.update(validTodo).then(function(todo){
				res.json(todo.toJSON());
			}, function(e){
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});

});

//DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {

	var id = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: id
			,userId : req.user.get('id')
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).send("hmm? Looks like that item doesn't exist");
		} else {
			res.status(204).send();
		}

	}, function() {
		res.status(500).send();
	});

});



//POST /users
app.post('/users', function(req, res) {

	var body = _.pick(req.body, 'email', 'password');

	if (body.email && typeof body.email === 'string') {
		body.email = body.email.trim();
	}

	if (body.password && typeof body.password === 'string') {
		body.password = body.password.trim();
	}


	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());

	}, function(e) {
		res.status(400).json(e);
	});

});


//POST /users/login
app.post('/users/login',  function(req, res) { 


	var body = _.pick(req.body, 'email', 'password');
	var userInstance;
	

	db.user.authenticate(body).then(function(user){
		
		var token = user.generateToken('authentication');
		userInstance = user;

		return db.token.create({
			token: token
		});

	}).then(function(tokenInstance){
		
		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
	}).catch(function(e){
		
		res.status(401).send();
	});

});//END of POST /users/login 


//POST /users/logout
app.delete('/users/logout', middleware.requireAuthentication, function(req, res) {

	req.token.destroy().then(function(){
		res.status(204).send();
	}).catch(function(){
		res.status(500).send();
	});
	

});



app.get('/', function(req, res) {
	res.send('Todo API Rest End Point');
});


db.sequelize.sync({force:true}).then(function() {
	app.listen(PORT, function() {
		console.log('Listening on port ' + PORT);
	});
});