const express = require('express');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = express.Router();

const saveUser = require('./saveUser');
const loginUser = require('./loginUser');
const User = require('../../db/models/User');
const Emailer = require('../../services/sendMail');
const validateRegisterInput = require('../../validation/register');
const validatePasswordInput = require('../../validation/password');
const validateLoginInput = require('../../validation/login');
const validateProfileInput = require('../../validation/profile');
const validateEmail = require('../../validation/email');
const validateResetPasswordInput = require('../../validation/resetpassword');

const secretOrKey = process.env.secretOrKey || 'key';

// Test endpoint
router.get('/', (req, res)=>res.json({msg: 'Users working'}));

// Register User
router.post('/register', (req, res)=>{

    const { errors, isValid } = validateRegisterInput(req.body);

    // Check Validation
    if(!isValid){
        return res.status(400).json(errors);
    }
    User.findOne({email: req.body.email})
        .then(user =>{
            if(user){
                errors.email = 'Email already exists';
                return res.status(400).json(errors);
            }
            const newUser = new User({
                email: req.body.email,
                password: req.body.password
            });
            jwt.sign({email: newUser.email}, secretOrKey, { expiresIn: '2d' }, (er, emailToken)=>{
                const link = `${process.env.backenUrl}/api/user/confirmation/${emailToken}`;
                const output = `
                <h3>Click the link below to confirm your account with iLearn Africa</h3>
                Link: ${link}`;
                Emailer(newUser.email, output);
            });

            saveUser(newUser, res);
        });
});

// Verify User account
router.get('/confirmation/:emailToken', (req, res) => {
    jwt.verify(req.params.emailToken, secretOrKey, (err, decoded) => {
        if(err){
            return res.status(400).json({email: 'Token is expired or corrupted, request another one'})
        }
        User.findOne({email: decoded.email})
            .then(user => {
                if (!user) {
                    return res.status(400).json({email: 'User not found, Register user'})
                } else if (user.IsAuthenticated){
                    return res.status(400).json({email: 'Email already verified'})
                } else {
                user.IsAuthenticated = true
                user.save()
                    .then(()=>{
                        return res.json({email: 'Email verified'})
                    });
                }
            });
    });
});

// Login User
router.post('/login', (req, res) => {

    const { errors, isValid } = validateLoginInput(req.body);

    // Check Validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    const password = req.body.password;
    const email = req.body.email;

    User.findOne({email})
        .then(user => {
            const errors= {}

            // Check for user
            if(!user){
                errors.email = 'User not found';
                return res.status(404).json(errors)
                
            } else if (!user.IsAuthenticated) {
                errors.email = 'Email not verified';
                return res.status(400).json(errors)
            }
            // check passsword
            bcrypt.compare(password, user.password)
                .then(isMatch=>{
                    if(isMatch){
                        loginUser(user, req, res);

                    }else{
                        errors.password = 'Password incorrent'
                        return res.status(400).json(errors)
                    }
                })
        })
})

// User Search
router.get('/search', (req, res) => {
    const userDisplay = [];
    delete req.query.ip;

    // Search query in the User model
    User.find({ ...req.query })
        .then(users => {
            for (const user of users) {
                userDisplay.push({
                    id: user._id,
                    IsAuthenticated: user.IsAuthenticated,
                    status: user.status,
                    email: user.email,
                    first_name: user.first_name,
                    register_date: user.register_date,
                    last_name: user.last_name,
                    activity_data: user.activity_data
                })
            }
            res.json(userDisplay);
        })
        .catch(err=> {
            console.log(err);
            res.json({error: 'An error occured'});
        })
})

router.get('/privilege/:id',  (req, res) => {
    User.findById(req.params.id)
        .then(user => {
            res.json({
                IsSuperAdmin: user.IsSuperAdmin
            })
        })
        .catch(()=>{
            res.status(401).json({error: 'User not found'})
        })
})

router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        id: req.user._id,
        email: req.user.email,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
    })
})

router.put('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    const first_name = req.body.first_name;
    const last_name = req.body.last_name;

    const email = {email: req.user.email};
    const profile = {first_name, last_name}
    User.findOneAndUpdate(email, profile, { new: true })
        .then(user => {
            res.json({
                id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                message: "Profile successfully updated"
            })
        })
})

// Change password
router.put('/password', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validatePasswordInput(req.body);

    // Check Validation
    if(!isValid){
        return res.status(400).json(errors);
    }
    
    const password = req.body.password;
    const old_password = req.body.old_password;
    const user = req.user;
    
    // check passsword
    bcrypt.compare(old_password, user.password)
        .then(isMatch=>{
            const errors= {}
            if(isMatch){
                user.password = password;
                saveUser(user, res);
                res.json({message: 'Password changed successfully'})

            }else{
                errors.password = 'Enter correct current password'
                return res.status(400).json(errors)
            }
        })

})

// Forgot password
router.get('/forgotpassword', (req, res) => {

    const { errors, isValid } = validateEmail(req.body);

    // Check Validation
    if(!isValid){
        return res.status(400).json(errors);
    }
    const { email } = req.body;
    
    User.findOne({ email })
        .then(user =>{
            if (!user){
                errors.email = 'User not found';
                return res.status(404).json(errors)
            }
            
            jwt.sign({ email }, secretOrKey, { expiresIn: '2d' }, (er, resetToken)=>{
                const link = `${process.env.backenUrl}/api/user/passwordreset/${resetToken}`;
                const output = `
                <h3>Click the link below to reset your pasword with iLearn Africa</h3>
                Link: ${link}`;
                
                Emailer(email, output);
            })
            res.json({ message: 'A password reset link has been sent to your email' })
        })
});

// Reset password
router.put('/passwordreset/:resetToken', (req, res) => {

    const { errors, isValid } = validateResetPasswordInput(req.body);

    // Check Validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    jwt.verify(req.params.resetToken, secretOrKey, (err, decoded) => {
        if(err){
            return res.status(400).json({email: 'Token is expired or corrupted, request another one'})
        }
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
                const email = decoded.email;
                const password = hash;
                User.findOne({email})
                    .then(user=>{
                        if (!user){
                            errors.email = 'User not found';
                            return res.status(404).json(errors)
                        }
                        user.password = hash
                        user.save()

                    })
                res.json({ message: "Password successfully updated" })
            });
        });
    });
});

router.get('/activity', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        activity: req.user.activity_data
    })
})

router.post('/google', passport.authenticate('google-plus-token', { session: false }), (req, res) => {
    if(req.user.provider){
        // User with no account yet
        const email = req.user.emails[0].value;
        const password = process.env.OAuthPassword;
        const newUser = new User({
            email,
            password
        });
        newUser.IsAuthenticated = true;
        newUser.save()
            .then(() => {
                User.findOne({email})
                    .then(user => {
                        loginUser(user, req, res);
                    })
                })
    } else {
        // Already registered user
        const email = req.user.email;
        User.findOne({email})
            .then(user => {
                loginUser(user, req, res);
            })
    }
});

router.post('/facebook', passport.authenticate('facebook-token', { session: false }), (req, res) => {
    if(req.user.provider){
        // User with no account yet
        const email = req.user.emails[0].value;
        const password = process.env.OAuthPassword;
        const newUser = new User({
            email,
            password
        });
        newUser.IsAuthenticated = true;
        newUser.save()
            .then(() => {
                User.findOne({email})
                    .then(user => {
                        loginUser(user, req, res);
                    })
                })
    } else {
        // Already registered user
        const email = req.user.email;
        User.findOne({email})
            .then(user => {
                loginUser(user, req, res);
            })
    }
});

router.get('/linkedin', linkedinMiddleware,  (req, res) => {
    const email = req.query.profile.email
    User.findOne({email})
        .then(user => {
            if(!user){
                // User with no account yet
                const password = process.env.OAuthPassword;
                const newUser = new User({
                    email,
                    password
                });
                newUser.IsAuthenticated = true;
                newUser.save()
                    .then(() => {
                        User.findOne({email})
                            .then(user => {
                                loginUser(user, req, res);
                            })
                        })
            } else {
                // Already registered user
                User.findOne({email})
                    .then(user => {
                        loginUser(user, req, res);
                    })
            }
        })
});

function linkedinMiddleware(req, res, next) {
    let access_token = req.query.access_token;
    fetch('https://api.linkedin.com/v2/me', {
        headers: { 'Authorization': `Bearer ${access_token}` },
    })
    .then(resp => resp.json())
    .then(user => {
        if(!user.id) {
            res.json({Error: 'Invalid access token'})
            return next()
        }
        fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
            headers: { 'Authorization': `Bearer ${access_token}` },
        })
        .then(resp => resp.json())
        .then(data => {
            req.query.profile = {
                email: JSON.stringify(data.elements[0]).split('"')[5],
                firstName: user.firstName.localized.en_US,
                lastName: user.lastName.localized.en_US
            }
            return next()
        })
    });
}

module.exports = router;
