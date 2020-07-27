const User = require('../models/user');
const { hash } = require('bcryptjs');
const getDb = require("../util/database").getDb;

const mongodb = require('mongodb');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const sendGridTransport = require('nodemailer-sendgrid-transport');
const { time } = require('console');
const { NONAME } = require('dns');
const transporter = nodemailer.createTransport(sendGridTransport({
    auth: { 
        api_key:'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'

    }
}))

exports.getReset = (req,res,next)=>{
    let message = req.flash('error');
    if(message.length<=0)
    message=null
    res.render('auth/reset.ejs',{
        docTitle: "Reset",
        url: req.url,
        errorMsg: message
    })
}

exports.postUpdate = (req, res, next)=>{
    const token = req.body.token;
    const newPass = req.body.password;
    const db = getDb();

    bcrypt.hash(newPass, 12).then(
        hashedPass =>{
            db.collection('users').updateOne({resetToken: token}, {$set: {password: hashedPass, resetToken:undefined, resetTokenExpiration: undefined}}).then(result=>{
                res.redirect('/login');
            })
        }
    )
    
}
exports.getNewPassword = (req, res, next)=>{
    const token = req.params.token;
    const db = getDb();
    db.collection('users').findOne({resetToken: token}).then(user=>{
        if(user){
            res.render('auth/new-password.ejs',{
                docTitle: "Reset Password",
                errorMsg: null,
                url: req.url,
                token: token
            })
        }
        else{
            console.log("Unauthorised Access");
        }
    })
}
exports.postReset = (req, res, next)=>{
    crypto.randomBytes(32, (err, buffer)=>{
        if(err){
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.fetchByEmail(req.body.email).then(user=>{
            if(user){
                const db = getDb();
                return db.collection('users').updateOne({email: req.body.email}, {$set: {resetToken: token, 
                    resetTokenExpiration: new Date.toISOString()
                    }})
                    
            }
            else{
                req.flash('error', 'User With This Email Does Not Exist');
                return res.redirect('/reset');
            }
        }).then(result=>{
            transporter.sendMail({
                to: req.body.email,
                from: 'iamvedant.vg@gmail.com',
                subject: 'Password Reset',
                html: `
                    <p>You Requested A Password Reset</p>
                    <p>Click On This <a href="http://localhost:3000/reset/${token}">Link</a></p>
                `
            })
            res.redirect('/login');
        })
    })
    
}
exports.getLogin = (req, res, next)=>{
    let message = req.flash('error');
    if(message.length<=0)
    message = null;


    res.render('auth/auth.ejs',{
        docTitle: "Login",
        url: req.url,
        isLoggedIn: req.session.isLoggedIn,
        csrfToken: req.csrfToken(),
        errorMsg: message
    })
}


exports.postLogout = (req, res, next)=>{
    req.session.user = null;
    req.session.isLoggedIn = false;
    res.redirect('/');

}
exports.postLogin = (req, res, next)=>
{
    let email = req.body.email;
    User.fetchByEmail(email).then(user=>{
        if(user)
        {
            bcrypt.compare( req.body.password, user.password).then(IsMatch=>{
                if(IsMatch==true){
                    req.session.isLoggedIn=true;
                    req.session.user = user;
                    res.redirect('/');
                }
                else{
                    req.flash('error', 'Invalid Email Or Password');
                    res.redirect('/login');
                }
            })
        }
        else{
            req.flash('error', 'Invalid Email Or Password');
            res.redirect('/login');
        }
    })
    
    
}

exports.getSignup = (req,res,next)=>{

    let message = req.flash('error');
    if(message.length<=0)
    message=null;

    
    res.render('auth/signup.ejs',{
        docTitle: "Signup",
        url: req.url,
        isLoggedIn: req.session.isLoggedIn,
        errorMsg: message
    })
}

exports.postSignup = (req, res, next)=>{
    let email = req.body.email;
    User.fetchByEmail(email).then(
        user=>
        {
          if(user)
          {
            req.flash('error', 'User With Email: '+ email + ' Already Exists')
            res.redirect('/signup');
          }
          else
          {
            const user = new User(req.body.name, email, null, [], []);
            user.save(req.body.password);
            res.redirect('/signup');
            return transporter.sendMail({
                to: email,
                from: 'iamvedant.vg@gmail.com',
                subject: 'SignUp Successfull',
                html: '<h1>You Successfully Signed Up</h1>'
            })
            
          }
        }
      ).catch(err=>{
          console.log(err);
      })
}