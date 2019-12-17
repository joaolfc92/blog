const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');
const bcrypt = require('bcryptjs');
const passport = require('passport')


router.get('/registro', (req,res) => {
	res.render('usuarios/registro');
})

// validação do formulario de cadastro de usuarios
router.post('/registro', (req,res) =>{
	var erros = [];

	if(!req.body.nome || req.body.nome.length <= 3 || typeof req.body.nome == undefined || typeof req.body.nome == null){
	   erros.push({texto : "Nome invalido, preencha novemente"})
	}

	if(!req.body.email ||  typeof req.body.email == undefined || typeof req.body.email == null){
		erros.push({texto : "Email invalido, preencha novemente"})
	}	

	
	if(!req.body.senha ||  typeof req.body.senha == undefined || typeof req.body.senha == null || req.body.senha.length <= 3){
		erros.push({texto : "Senha invalido, preencha novemente"})	
	}

	if(!req.body.senha2 ||  typeof req.body.senha2 == undefined || typeof req.body.senha2 == null || req.body.senha2.length <= 3){
		erros.push({texto : "Senha invalido, preencha novemente"})	
	}

	if(req.body.senha != req.body.senha2){
		erros.push({texto: "Senhas diferentes"})
	}


	if(erros.length>0){ // verificação para ver se todos os campos foram digitados certos
		res.render('usuarios/registro', {erros:erros})
	}else{

		Usuario.findOne({email: req.body.email}).then((usuario)=>{ // verificaço para ver se  o usuario ja foi cadastrado
			if(usuario){
				req.flash("error_msg","Usuário ja cadastrado")
				res.redirect("/usuarios/registro")
			}else{
				//criando usuario no banco
				const novoUsuario = new Usuario({
					nome: req.body.nome,
					email: req.body.email,
					senha: req.body.senha,
					
				})

				// encripitando senha

				bcrypt.genSalt(10, (erro,salt) => {
					bcrypt.hash(novoUsuario.senha,salt,(erro,hast)=>{
						// função recebe 3 parametros - (a função novo usuario com a senha, o salt que encripta e a função callback)
						if(erro){
							req.flash('erro_msg', "houve um erro ao salvar")
							res.redirect('/')
						}
						//senha encriptada
						novoUsuario.senha = hast
						// salvando usuario no banco
						novoUsuario.save().then(()=>{
							req.flash("success_msg","Usuario criado com sucesso")
							res.redirect("/")
						}).catch((erro)=>{
							req.flash('error_msg',"Erro ao criar ao usuario, tente novamente")
							res.redirect('/usuarios/registro')
						})
					})
				})


			}
		}).catch((error)=>{
			req.flash("error_msg","Houve um erro interno")
			res.redirect('/')
		})
	}
	
	
	
})


// rota para o formulario de loguin

router.get("/login", (req,res)=>{
	res.render('usuarios/login')
})

// aqui estou dizendo o que fazer caso faça o loguin, não faça e exiba mensagem na tela
router.post('/login', (req,res,next)=>{
// autenticação de senha
passport.authenticate('local', {
	successRedirect: "/",
	failureRedirect:"/usuarios/login",
	failureFlash:true
})(req,res,next)


})


router.get('/logout', (req,res)=>{
	req.logout()
	req.flash('success_msg', "Sessão encerrada com sucesso")
	res.redirect('/')
})



module.exports = router;