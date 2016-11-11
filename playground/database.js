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

sequelize.sync().then(function() {
	console.log('Everything is synced');

	Todo.create({
		
		description : "unpack boxes"
	}).then(function(todo){
		console.log('loaded first record');
		console.dir(todo);

	}).catch(function(e){
		console.log(e.errors[0].message);
	});
});