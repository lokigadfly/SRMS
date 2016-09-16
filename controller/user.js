var path = require('path');
var db = require(path.join(__dirname, '../utilities/db'));


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
            return res.redirect('/');
        }
        // console.log(req.body['species[]']);
        var species = [];
        for (i = 0; i < req.body['species[]'].length; i++) {
            species.push({ name: req.body['species[]'][i] });
        }
        user_pingpong = {
            name: req.body.name,
            email: req.body.email,
            number: req.body.number,
            telephone: req.body.telephone,
            gender: req.body.gender,
            class: req.body.class,
            year: req.body.year,
            species: species
        };
        // console.log(req.session.user['nickname']);
        db.connect(function(db) {
            db.collection('user').updateOne({ 'nickname': req.session.user['nickname'] }, { $set: { user_pingpong: user_pingpong } }, function(err, result) {
                if (err) {

                    return;
                } else {


                    return;

                }
            });
        });

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
                    pingpong_list = result['user_pingpong'];
                    res.render('enrolling', { user: req.session.user, error: error_list, list: pingpong_list });
                }
            });
        });
        // console.log(pingpong_list);

    }
};
// exports.nandan = (req, res) => {
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
        return res.redirect('/');
    }
};
exports.postLogin = (req, res) => {
    db.connect(function(db) {
        db.collection('user').findOne({ nickname: req.body.nickname }, (err, existingUser) => {
            if (existingUser) {
                if (req.body.password == existingUser['password']) {
                    var user_list = { 'nickname': req.body.nickname };
                    req.session.user = user_list;
                    return res.redirect('/');
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
            user_obj = {
                nickname: req.body.nickname,
                password: req.body.password
            };
            db.collection('user').insertOne(user_obj, function(err, result) {
                if (err) {
                    return next(err);
                }
                return res.redirect('/login');
            });
        });
    });
};
