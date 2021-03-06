'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var getPolls = require(path + '/app/controllers/polls.partials.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}
	
	//will call the getPolls function if the polls partials function is on the page being rendered
	//need to create a getPolls funciton which will access the database and load each of the polls on the database
	//this will happen automatically on page load so do not need to change clickHandler or clickController
	//THIS DOES NOT WORK
	/*
	app.use(function(req, res, next){
    	if(!res.locals.partials) res.locals.partials = {};
    	res.locals.partials.polls = getPolls.returnPolls();
    	next();
	});
	*/

	//what is this?
	var clickHandler = new ClickHandler();	
	
	//when logged in, you get the home screen
	app.route('/')
		.get(isLoggedIn, function (req, res) {
			res.render('home');
		});
	
	//if not logged in, you get the log in page first
	app.route('/login')
		.get(function (req, res) {
			res.render('login', {layout: false});
		});
	
	//logs you out and redirects you to the login page
	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	//if you are logged in, you can access the profile page
	//TO BE DELETED, THERE WILL BE NO PROFILE PAGE
	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.render('profile');
		});
	
	//if you are logged in and want to create a new poll	
	app.route('/newpoll')
		.get(isLoggedIn, function (req, res){
			res.render('newpoll');	
		});
		
	//for testing of new poll data entry
	app.route('/process_GET')
		.get(function (req, res){
			var response = {
				pollname:req.query.pollname,
				options:req.query.options
			};
			res.end(JSON.stringify(response));
		});
	
	
	
	//if you are logged in and want to see all of the polls you created
	app.route('/mypolls')
		.get(isLoggedIn, function (req, res){
			res.render('mypolls');
		});
	
	//gets user information from github
	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});
	
	//authenticates user on github
	app.route('/auth/github')
		.get(passport.authenticate('github'));
	
	//if user is authenitated, redirected to main page, if not they are sent back to the login page
	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));
	
	//handles user action when user clicks one of the two buttons. these will be changed
	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
};
