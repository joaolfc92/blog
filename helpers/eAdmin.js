module.exports = {
	eAdmin: function(req, res, next){
		if(req.isAuthenticated() && req.user.eAdmin == 1){
			return next();
		}

		req.flash('error_msg', "Faça login como admin para acessar aqui")
		res.redirect('/');
	}
}