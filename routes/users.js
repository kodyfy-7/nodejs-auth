const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/User');

//router.get('/', function(req, res) {});
//Login
router.get('/login', (req, res) => res.render('login'));

//Register
router.get('/register', (req, res) => res.render('register'));

//Register Handle
router.post('/register', (req, res) => {
    // console.log(req.body)
    // res.send('Hello')
    const { name, email, password, password2 } = req.body;
    let errors = [];

    //check required fields
    if(!name || !email || !password || !password2) {
        errors.push({msg: 'Missing required fields'});
    }

    //Check password match
    if(password !== password2) {    
        errors.push({msg: 'Passwords do not match'});
    }

    //Check password length
    if(password.length < 6) { 
        errors.push({msg: 'Password must be at least 6 characters long'});
    }

    if(errors.length > 0) {
        res.render('register', { 
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        //Validation passed
        User.findOne({ email: email })
            .then(user => { 
                //User exists
                if (user) {
                    errors.push({msg: 'User already exists'})
                    res.render('register', { 
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else { 
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    //Hash password
                    bcrypt.genSalt(10, (err, salt) => 
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) throw err;
                            //Set password to hash
                            newUser.password = hash;

                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'Successfully registered. Login')
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));

                    }));
                }
            });
    }
});

module.exports = router;