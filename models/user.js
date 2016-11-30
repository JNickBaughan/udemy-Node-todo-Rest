var bcryptjs = require('bcryptjs');
var _ = require('underscore');
var jwt = require('jsonwebtoken');
var cryptojs = require('crypto-js');

module.exports = function(sequelize, DataTypes) {

		var user = sequelize.define('user', {
				email: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
					validate: {
						isEmail: true
					}
				},
				salt: {
					type: DataTypes.STRING
				},
				password_hash: {
					type: DataTypes.STRING
				},
				password: {
					type: DataTypes.VIRTUAL,
					allowNull: false,
					validate: {
						len: [7, 100]
					},
					set: function(value){

						var salt = bcryptjs.genSaltSync(10);
						var hashedPassword = bcryptjs.hashSync(value, salt);

						this.setDataValue('password', value);
						this.setDataValue('salt', salt);
						this.setDataValue('password_hash', hashedPassword);
					}
				}
			}, {
				hooks: {
					beforeValidate: function(user, options) {
						if (typeof user.email === 'string') {
							user.email = user.email.toLowerCase();
						}
					}//beforeValidate()
					
				}//hooks
				,classMethods: {
					authenticate: function(body){

						return new Promise(function(resolve, reject){

							if (typeof body.email !== 'string' || typeof body.password !== 'string') {//email or password isn't a string
								
								return reject();
							}

							user.findOne({
								where: {
									email: body.email
									//do i need password here?
								}
							}).then(
							function(user){//success
								
								if(!user || !bcryptjs.compareSync(body.password, user.get('password_hash'))){//user doesn't exist or 
									
									return reject();
								}

								resolve(user);
							},
							function(e){//fail
								
								reject();
							});

						});
					}//authenticate()
					,findByToken: function(token){ 
						return new Promise(function(resolve, reject){
							try{

								
								var decodedJWT = jwt.verify(token, "dhfiejl54%&hdy");
								
								
								var bytes = cryptojs.AES.decrypt(decodedJWT.token, "15&^8fr5");
									
								var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
								

									user.findById(tokenData.id).then(
										function(user){
											
											if(user){
												
												resolve(user);
											}else{
												reject();
											}
									},function(e){
										reject();
									});

							}catch(e){
								
								reject();
							}
						});
					}
				}//classMethods
				,instanceMethods: {
					
					toPublicJSON: function (){
						var json = this.toJSON();
						return _.pick(json, 'id', 'email', 'updatedAt', 'createdAt');
					}//toPublicJSON();

					,generateToken: function(type){
						
						if(!_.isString(type)){ 
							return undefined;
						}
						try{
							
							var stringData = JSON.stringify({ id : this.get('id'), type: type });
							
							var encryptedDate = cryptojs.AES.encrypt(stringData, "15&^8fr5").toString();
							var token = jwt.sign({
								token: encryptedDate
							}, "dhfiejl54%&hdy");
							
							return token;

						}catch(e){
							
							return undefined;
						}
					}

				}//instanceMethods

		});

	return user;
	}//sequelize.define