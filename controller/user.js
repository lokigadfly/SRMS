var path = require('path');
var db = require(path.join(__dirname, '../utilities/db'));

exports.adminmainpage = (req, res) => {
	var error_list = req.flash('errors');
	if (!req.session.user) {
		res.render('login', { error: error_list });
	} else {
		res.render('admin', {});
	}
};

exports.adminmatch = (req, res) => {
	var error_list = req.flash('errors');
	if (!req.session.user) {
		return res.render('login', { error: error_list });
	}
	db.connect(function(db) {
		var keyword = req.path;
		keyword = keyword.split('/');
		if (keyword.length < 3) {
			res.render('adminmatch', { error: "服务器错误" });
			return;
		}
		keyword = keyword[2];
		if (keyword === '') {
			res.render('adminmatch', { error: "服务器错误" });
			return;
		}
		console.log(keyword);
		var chinese_name;
		if (keyword == "nvdan") {
			chinese_name = "女单";
		}
		if (keyword == "nandan") {
			chinese_name = "男单";
		}
		if (keyword == "nanshuang") {
			chinese_name = "男子双打";
		}
		if (keyword == "nvshuang") {
			chinese_name = "女子双打";
		}
		if (keyword == "hunshuang") {
			chinese_name = "混合双打";
		}
		if ((keyword == "nvdan") || (keyword == "nandan")) {
			var data = [];

			cursor = db.collection('user').find({ "species.name": chinese_name });
			cursor.each(function(err, result2) {
				if (err) {
					return res.render('adminmatch', { error: "服务器错误" });
				}
				var single = {};
				if (result2) {
					single.nickname = result2.nickname;
					single.name = result2.name;
					single.email = result2.email;
					single.gender = result2.gender;
					single.year = result2.year;
					single.class = result2.class;
					single.number = result2.number;
					single.telephone = result2.telephone;
					single.random = result2.random;
					data.push(single);
				}

				if (result2 == null) {
					return res.render('adminmatch', { data, mode: chinese_name });
				}

			});
		}
		if ((keyword == "nvshuang") || (keyword == "nanshuang") || (keyword == "hunshuang")) {
			cursor = db.collection('team').find({ species: chinese_name });
			var data = [];
			var allmember = [];
			cursor.each(function(err, result2) {
				if (err) {
					return res.render('adminmatch', { error: "服务器错误" });
				}
				if (result2) {

					allmember.push(result2.member[0]);
					allmember.push(result2.member[1]);


				}
				if (result2 == null) {

					for (var i = 0; i < allmember.length; i++) {　　
						(function(i) {
							db.collection('user').findOne({ random: allmember[i] }, function(err, doc) {

								var single = {};
								single.nickname = doc.nickname;
								single.name = doc.name;
								single.email = doc.email;
								single.gender = doc.gender;
								single.year = doc.year;
								single.class = doc.class;
								single.number = doc.number;
								single.telephone = doc.telephone;
								single.random = doc.random;
								data.push(single);
								if (i==allmember.length-1){
							return res.render('adminmatch', { data, mode: chinese_name });
						}
							});
						})(i);

					}
				}
			});
		}
	});
};

exports.enroll_pingpong = (req, res, next) => {
	var error_list = req.flash('errors');
	if (!req.session.user) {
		res.render('login', { error: error_list });
	} else {
		req.assert('name', '姓名不能为空!').notEmpty();
		req.assert('email', 'Email格式不正确!').isEmail();
		req.assert('number', '学号工号必须为数字!').isInt();
		req.assert('number', '学号不能为空!').notEmpty();
		req.assert('telephone', '手机必须为数字!').isInt();
		req.assert('telephone', '手机不能为空!').notEmpty();
		req.assert('telephone', '手机必须为11位').len(11);
		req.assert('species[]', '未选择参加项目').notEmpty();
		req.sanitize('email').normalizeEmail({ remove_dots: false });

		const errors = req.validationErrors();
		if (errors) {
			req.flash('errors', errors);
			return res.redirect('/enroll');
		}
		var species = [];

		if (typeof req.body['species[]'] == 'string') {

			species.push({ name: req.body['species[]'] });
		}
		if (typeof req.body['species[]'] == 'object') {
			for (i = 0; i < req.body['species[]'].length; i++) {

				species.push({ name: req.body['species[]'][i] });
			}
		}

		db.connect(function(db) {
			db.collection('user').updateOne({ 'nickname': req.session.user['nickname'] }, {
				$set: {
					name: req.body.name,
					email: req.body.email,
					number: req.body.number,
					telephone: req.body.telephone,
					gender: req.body.gender,
					class: req.body.class,
					year: req.body.year,
					species: species
				}
			}, function(err, result) {
				if (err) {

					return;
				} else {
					var errorse = { msg: "提交成功" };
					req.flash('errors', errorse);
					return res.redirect('/enroll');

				}
			});
		});

	}

	function randomizeid() {
		var text = "";
		possible = "0123456789";
		for (var i = 0; i < 8; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}


};


exports.mainpage = (req, res) => {
	var error_list = req.flash('errors');
	if (!req.session.user) {
		res.render('login', { error: error_list });
	} else {
		var pingpong_list = [];
		db.connect(function(db) {
			db.collection('user').findOne({ nickname: req.session.user['nickname'] }, (err, result) => {
				if (err) {

					return;
				} else {
					var list = {
						name: result['name'],
						email: result['email'],
						number: result['number'],
						telephone: result['telephone'],
						gender: result['gender'],
						dengji: result['class'],
						year: result['year'],
						species: result['species'],
						random: result['random']
					};

					res.render('enrolling', { user: req.session.user, error: error_list, list });
				}
			});
		});


	}
};
exports.nandan = (req, res) => {
	var error_list = req.flash('errors');
	if (!req.session.user) {
		res.render('login', { error: error_list });
	} else {
		var pingpong_list = [];
		db.connect(function(db) {
			db.collection('user').findOne({ nickname: req.session.user['nickname'] }, (err, result) => {
				if (err) {

					return;
				} else {
					hasnandan = false;
					for (let i = 0; i < result.species.length; i++) {
						if (result.species[i].name == "男单") {
							hasnandan = true;
						}
					}
					if (hasnandan == true) {

						group_needed = false;
						has_group = false;
						var list = {
							name: result['name'],
							email: result['email'],
							number: result['number'],
							telephone: result['telephone'],
							gender: result['gender'],
							dengji: result['class'],
							year: result['year'],
							species: result['species'],
							random: result['random']
						};

						res.render('species', { user: req.session.user, error: error_list, list, mode: "男子单打", matchtime: "2016年10月15日开始" });
					} else {
						return;
					}
				}
			});
		});
		// console.log(pingpong_list);

	}
};

exports.createteam = (req, res) => {
	var error_list = req.flash('errors');
	if (!req.session.user) {
		res.render('login', { error: error_list });
	} else {
		var species = req.body.species || '';
		var number1 = req.body.number1 || '';
		var number2 = req.body.number2 || '';
		if (number1 == number2) {
			return res.json({ error: "不能和自己组队." });
		}
		var member = [];
		member.push(number1);
		member.push(number2);
		db.connect(function(db) {
			db.collection('user').findOne({ random: number1 }, (err, result1) => {
				if (err) {
					return res.json({ error: "无此id" });
				} else {
					if (result1 == null) {
						return res.json({ error: "无此id" });
					}
					db.collection('user').findOne({ random: number2 }, (err, result2) => {
						if (err) {
							return res.json({ error: "无此id" });
						} else {
							if (result2 == null) {
								return res.json({ error: "无此id" });
							}
							db.collection('team').insert({ member: member, species: species }, (err, result) => {
								if (err) {
									return res.redirect('/');
								} else {
									res.json({ error: null });
								}
							});
						}
					});
				}
			});


		});
	}
};



exports.nvdan = (req, res) => {
	var error_list = req.flash('errors');
	if (!req.session.user) {
		res.render('login', { error: error_list });
	} else {
		var pingpong_list = [];
		db.connect(function(db) {
			db.collection('user').findOne({ nickname: req.session.user['nickname'] }, (err, result) => {
				if (err) {

					return;
				} else {
					hasnvdan = false;
					for (let i = 0; i < result.species.length; i++) {
						if (result.species[i].name == "女单") {
							hasnvdan = true;
						}
					}
					if (hasnvdan == true) {
						group_needed = false;
						has_group = false;
						var list = {
							name: result['name'],
							email: result['email'],
							number: result['number'],
							telephone: result['telephone'],
							gender: result['gender'],
							dengji: result['class'],
							year: result['year'],
							species: result['species'],
							random: result['random']
						};
						res.render('species', { user: req.session.user, error: error_list, list, mode: "女子单打", matchtime: "2016年10月15日开始" });
					} else {
						return;
					}
				}
			});
		});
	}
};


exports.nvshuang = (req, res) => {
	var error_list = req.flash('errors');
	if (!req.session.user) {
		res.render('login', { error: error_list });
	} else {
		var pingpong_list = [];
		db.connect(function(db) {
			db.collection('user').findOne({ nickname: req.session.user['nickname'] }, (err, result) => {
				if (err) {

					return;
				} else {
					hasnvshuang = false;
					for (let i = 0; i < result.species.length; i++) {
						if (result.species[i].name == "女双") {
							hasnvshuang = true;
						}
					}
					if (hasnvshuang == true) {
						group_needed = true;
						has_group = false;
						var list = {
							name: result['name'],
							email: result['email'],
							number: result['number'],
							telephone: result['telephone'],
							gender: result['gender'],
							dengji: result['class'],
							year: result['year'],
							species: result.species,
							random: result['random']
						};
						cursor = db.collection('team').find({ member: result['random'] });
						cursor.each(function(err, result2) {
							if (err) {
								has_group = false;
							}
							if (result2) {

								if (result2['species'] == "女子双打") {
									has_group = true;
								}
							}
							if (result2 == null) {
								return res.render('species', { user: req.session.user, error: error_list, list, mode: "女子双打", matchtime: "2016年10月15日开始", group_needed: group_needed, has_group: has_group });
							}
						});
					} else {}
				}

			});
		});




	}
};
exports.nanshuang = (req, res) => {
	var error_list = req.flash('errors');
	if (!req.session.user) {
		res.render('login', { error: error_list });
	} else {
		var pingpong_list = [];
		db.connect(function(db) {
			db.collection('user').findOne({ nickname: req.session.user['nickname'] }, (err, result) => {
				if (err) {

					return res.json({ error: "你还未登录！" });
				} else {
					hasnvshuang = false;
					for (let i = 0; i < result.species.length; i++) {
						if (result.species[i].name == "男双") {
							hasnvshuang = true;
						}
					}
					if (hasnvshuang == true) {
						group_needed = true;
						has_group = false;
						var list = {
							name: result['name'],
							email: result['email'],
							number: result['number'],
							telephone: result['telephone'],
							gender: result['gender'],
							dengji: result['class'],
							year: result['year'],
							species: result.species,
							random: result['random']
						};
						cursor = db.collection('team').find({ member: result['random'] });
						cursor.each(function(err, result2) {
							if (err) {
								has_group = false;
							}
							if (result2) {

								if (result2['species'] == "男子双打") {
									has_group = true;
								}
							}
							if (result2 == null) {
								return res.render('species', { user: req.session.user, error: error_list, list, mode: "男子双打", matchtime: "2016年10月15日开始", group_needed: group_needed, has_group: has_group });
							}
						});
					} else {}
				}
			});
		});
	}
};


exports.hunshuang = (req, res) => {
	var error_list = req.flash('errors');
	if (!req.session.user) {
		res.render('login', { error: error_list });
	} else {
		var pingpong_list = [];
		db.connect(function(db) {
			db.collection('user').findOne({ nickname: req.session.user['nickname'] }, (err, result) => {
				if (err) {

					return res.json({ error: "你还未登录！" });
				} else {
					hasnvshuang = false;
					for (let i = 0; i < result.species.length; i++) {
						if (result.species[i].name == "混双") {
							hasnvshuang = true;
						}
					}
					if (hasnvshuang == true) {
						group_needed = true;
						has_group = false;
						var list = {
							name: result['name'],
							email: result['email'],
							number: result['number'],
							telephone: result['telephone'],
							gender: result['gender'],
							dengji: result['class'],
							year: result['year'],
							species: result.species,
							random: result['random']
						};
						cursor = db.collection('team').find({ member: result['random'] });
						cursor.each(function(err, result2) {
							if (err) {
								has_group = false;
							}
							if (result2) {

								if (result2['species'] == "混合双打") {
									has_group = true;
								}
							}
							if (result2 == null) {
								return res.render('species', { user: req.session.user, error: error_list, list, mode: "混合双打", matchtime: "2016年10月15日开始", group_needed: group_needed, has_group: has_group });
							}
						});
					} else {}
				}
			});
		});
	}
};

// exports.getteampage = (req, res) => {
//     var error_list = req.flash('errors');
//     if (!req.session.user) {
//         res.render('login', { error: error_list });
//     } else {
//         var pingpong_list = [];
//         db.connect(function(db) {
//             db.collection('user').findOne({ nickname: req.session.user['nickname'] }, (err, result) => {
//                 if (err) {

//                     return;
//                 } else {


//                         pingpong_list = result['user_pingpong'];
//                         res.render('teampage', { user: req.session.user, error: error_list, list: pingpong_list});

//                 }
//             });
//         });

// exports.nanshuang = (req, res) => {
//     var error = req.flash('error');
//     if (!req.session.user) {
//         res.render('login', { error: error });
//     } else {
//         db.connect(function(db) {
//             db.collection('user').findOne({ nickname: req.session.user['nickname'] }, (err, result) => {
//                 if (err) {

//                     return;
//                 } else {
//                 	var group_list=[];
//                     pingpong_list = result['user_pingpong'];
//                     db.collection('group').find().toArray(function (err, result2) => {
//                     	if (err){
//                     		return res.render('species', { user: req.session.user, error: error_list, list: pingpong_list, mode: "nandan",group_find:null });
//                     	}else{
//                     		// for (let i = 0; i < result2.length; i++) {
//                     		// }
//                     		// return res.render('species', { user: req.session.user, error: error_list, list: pingpong_list, mode: "nandan",group_find:group_list });
//                     	}
//                    });
//                 }
//             });
//         });

//     }
// };



exports.getLogin = (req, res) => {
	var error = req.flash('error');
	if (!req.session.user) {
		res.render('login', { error: error });
	} else {
		return res.redirect('/enroll');
	}
};
exports.postLogin = (req, res) => {
	if ((req.body.nickname == "admin") && (req.body.password == "wozaizheli")) {
		var user_list = { 'nickname': req.body.nickname };
		req.session.user = user_list;
		return res.redirect('/admin');
	}
	db.connect(function(db) {
		db.collection('user').findOne({ nickname: req.body.nickname }, (err, existingUser) => {
			if (existingUser) {
				if (req.body.password == existingUser['password']) {
					var user_list = { 'nickname': req.body.nickname };
					req.session.user = user_list;
					return res.redirect('/enroll');
				} else {
					req.flash('errors', { msg: '密码错误' });
					return res.redirect('login');
				}
			} else {
				req.flash('errors', { msg: '没有此用户' });
				return res.redirect('login');
			}
		});
	});
};


exports.getSignup = (req, res) => {
	var error_list = req.flash('errors');
	res.render('signup', { error: error_list });
};




exports.postSignup = (req, res, next) => {
	req.assert('password', '密码至少要4位长度！').len(4);
	req.assert('confirmPassword', '两次密码输入不一致！').equals(req.body.password);
	const errors = req.validationErrors();
	if (errors) {
		req.flash('errors', errors);
		return res.redirect('/signup');
	}
	db.connect(function(db) {
		db.collection('user').findOne({ nickname: req.body.nickname }, (err, existingUser) => {
			if (existingUser) {
				req.flash('errors', { msg: '这个昵称已经被注册过了！' });
				return res.redirect('/signup');
			}
			var random = randomizeid();
			user_obj = {
				nickname: req.body.nickname,
				password: req.body.password,
				random: random
			};
			db.collection('user').insertOne(user_obj, function(err, result) {
				if (err) {
					return next(err);
				}
				return res.redirect('/login');
			});
		});
	});

	function randomizeid() {
		var text = "";
		possible = "0123456789";
		for (var i = 0; i < 8; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}
};
