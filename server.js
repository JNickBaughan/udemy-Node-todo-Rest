var express = require('express');
var app = express();
var _ = require('underscore');
var db = require('./db.js');

var parser = require('body-parser');
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(parser.json());

//GET /todos ?complete=true
app.get('/todos', function(req, res) {

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
app.get('/todos/:id', function(req, res) {

	var id = parseInt(req.params.id, 10);

	db.todo.findById(id).then(function(todoItem) {

		if (!!todoItem) {
			res.json(todoItem.toJSON());
		} else {
			res.status(404).send();
		}

	}, function(e) {
		res.status(500).send();
	});

});

//POST /todos
app.post('/todos', function(req, res) {

	var body = _.pick(req.body, 'description', 'complete');

	if (body.description && typeof body.description === 'string') {
		body.description = body.description.trim();
	}


	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());

	}, function(e) {
		res.status(400).json(e);
	});

});


//PUT /todos/:id
app.put('/todos/:id', function(req, res) {

	var id = parseInt(req.params.id, 10);
	var updatedTodo = _.pick(req.body, 'description', 'complete');
	var validTodo = {};

	if (updatedTodo.hasOwnProperty('complete')) {
		validTodo.complete = updatedTodo.complete;
	}

	if (updatedTodo.hasOwnProperty('description')) {
		validTodo.description = updatedTodo.description.trim();
	}

	db.todo.findById(id).then(function(updatedItem) {
		if (updatedItem) {
			updatedItem.update(validTodo).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
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
app.delete('/todos/:id', function(req, res) {

	var id = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: id
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
		res.json(user.toJSON());

	}, function(e) {
		res.status(400).json(e);
	});

});


app.get('/', function(req, res) {
	res.send('Todo API Rest End Point');
});


db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Listening on port ' + PORT);
	});
});