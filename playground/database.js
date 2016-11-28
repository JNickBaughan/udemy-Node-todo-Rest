var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {

	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
	description:{
		type: Sequelize.STRING
		,allowNull : false
		,validate : {
			len : [1, 250]		}
	},
	complete:{
		type: Sequelize.BOOLEAN
		,allowNull : false
		,defaultValue : false
	}
});

var User = sequelize.define('user', {
	email: Sequelize.STRING
});

Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync({
	force: false
}).then(function() {
	console.log('Everything is synced');

	User.findById(1).then(function(user){
				user.getTodos({ where : {
					complete : false
					} }).then(function(todos){
					todos.forEach(function(todo){
						console.log(todo.toJSON());
					});
				});
			});

	/*User.create({
		email: 'newEmail@email.com'
	}).then(function(){
		Todo.create({
			description: 'clean yard'
		}).then(function(todo){
			User.findById(1).then(function(user){
				user.addTodo(todo);
			});
		});
	})*/

	/*Todo.create({
		
		description : "unpack boxes"
	}).then(function(todo){
		console.log('loaded first record');
		console.dir(todo);

	}).catch(function(e){
		console.log(e.errors[0].message);
	});*/
});