const express = require('express');
const router = express.Router(); // constante para usar rotas em arquivos separados
const mongoose = require('mongoose');
require('../models/Categoria') // IMPORTANDO O AQRUIVO MODELS/CATEGORIA
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin')





//CRIANDO ROTAS
router.get("/",eAdmin, (req,res)=>{
	res.render("admin/index")
})
   
router.get("/categorias", eAdmin, (req,res)=>{
	Categoria.find().sort({date:'desc'}).then((categorias)=>{
		res.render('admin/categorias', {categorias:categorias})
	}).catch((error)=>{
		req.flash("erro_msg","Houve um erro ao listas as categorias")
		res.redirect("/admin")
	})
	
})

// Categorias.procure : sort para alinhar a ordem decrescente

router.get('/categorias/add', eAdmin, (req,res) =>{
	res.render('admin/addcategorias')  
})

// RECEBENDO OD DADOS DO FORMULARIO E CADASTRANDO OS DADOS NO BANCO
router.post('/categorias/nova',eAdmin, (req,res) =>{

	// VALIDAÇÃO DO FORMULARIO
	var erros = [];
	if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === "" || req.body.nome === null){
		erros.push({texto: "Nome inválido"})
	}

	if(!req.body.slug || typeof req.body.slug === undefined || req.body.slug === "" || req.body.slug === null ){
		erros.push({texto: "Slug inválido"})
	}

	if(req.body.nome.length<4){
		erros.push({texto:"Minimo de caracteres 4"})
	}

	if(erros.length >0){
		res.render("admin/addcategorias",{erros:erros})
	}else{
		const novaCategoria = {
			nome: req.body.nome,
			slug: req.body.slug
		} 
		
		// criando no banco de dados as categorias recebidas
		new Categoria(novaCategoria).save().then(()=>{
			req.flash("success_msg","Categoria Criada com Sucesso") // estou passando valores para as variaveis globais criadas no MIDDLEWARE
			res.redirect('/admin/categorias')
		}).catch((erro)=>{
			req.flash("error_msg","Falha ao se conectar, tente novamente !!");
			res.redirect("/admin")
		})
	}
	})


	// EDITAR CATEGORIAS

	router.get("/categorias/edit/:id",eAdmin, (req,res)=>{
			Categoria.findOne({_id:req.params.id}).then((categoria)=>{
			res.render('admin/editcategorias',{categoria:categoria})
		 
		}).catch((erro)=>{
			req.flash('Essa categoria não existe')
			res.redirect('admin/categorias')
		})
		
	})	
	
	
	// PEGANDO A CATEGORIA E SUBSTITUINDO PELO EDITADO
	router.post('/categorias/edit',eAdmin, (req,res)=>{
		Categoria.findOne({_id: req.body.id}).then((categoria)=>{

			categoria.nome = req.body.nome
			categoria.slug = req.body.slug

			categoria.save().then(()=>{
				req.flash('success_msg','Categoria Editada com Sucesso')
				res.redirect('/admin/categorias')
			}).catch((erro)=>{
				req.flash('error_msg','Houve um Erro, Tente novamente mais tarde')
				res.redirect('/admin/categorias')
			})


		}).catch((erro)=>{
			req.flash('error_msg','Houve um erro')
			res.redirect('/admin/categorias')
		})
	})


	// ROTA PARA DELETAR CATEGORIAS

	router.post("/categorias/deletar", eAdmin,(req,res) =>{
		Categoria.remove({_id: req.body.id}).then(()=>{
			req.flash("success_msg", "Categoria deletada com sucesso")
			res.redirect("/admin/categorias")
		}).catch((erro)=>{
			res.flash("error_msg", "Houve um erro, tente novamente")
			res.redirect("/admin/categorias")
		})
	})


	//  CRIANDO ROTA PARA AS POSTAGENS E EXIBINDO AS POSTAGENS EXISTENTES

	router.get("/postagens", eAdmin,(req,res) =>{
		Postagem.find().populate("categoria").sort({data:"desc"}).then((postagens)=>{
			res.render("admin/postagens", {postagens:postagens})
		}).catch((erro)=>{
			req.flash('Houve um erro ao listar as postagens'+erro)
			res.redirect('/admin')
		})
		
	})


	// ROTA DE ADIÇÃO DE POSTAGENS
	router.get("/postagens/add",eAdmin, (req,res)=>{
		Categoria.find().then((categorias)=>{
			res.render("admin/addpostagens",{categorias: categorias})
		}).catch((erro)=>{
			req.flash('error_msg', "Houve um erro, tente novamente mais tarde")
			res.redirect("/admin/postagens") 
		})
		
	})


	// ROTA PARA SALVAR AS POSTAGENS NO BANCO

	router.post("/postagens/nova",eAdmin,(req,res)=>{

		// validação

		var erros = [];
		if(!req.body.titulo || typeof req.body.titulo === undefined || req.body.titulo === "" || req.body.titulo === null){
			erros.push({texto: "Nome inválido"})
		}
	
		if(!req.body.slug || typeof req.body.slug === undefined || req.body.slug === "" || req.body.slug === null ){
			erros.push({texto: "Slug inválido"})
		}

		if(!req.body.descricao || typeof req.body.descricao === undefined || req.body.descricao=== "" || req.body.descricao === null || req.body.descricao.length <= 4){
			erros.push({texto: "Descrição inválido"})
		}

		if(!req.body.conteudo || typeof req.body.conteudo === undefined || req.body.conteudo=== "" || req.body.conteudo === null || req.body.conteudo.length <= 4){
			erros.push({texto: "Conteudo inválido"})
		}

		if(req.body.categoria == 0){
			erros.push({texto: "Categoria Inválida"})
		}

		if(erros.length >0){
			Categoria.find().then((categorias) =>{
				res.render("admin/addpostagens",{erros:erros, categorias:categorias})
			})
			
		}else{
			const novaPostagem = {
				titulo: req.body.titulo,
				slug: req.body.slug,
				descricao: req.body.descricao,
				conteudo:req.body.conteudo,
				categoria:req.body.categoria
			} 
			
			// criando no banco de dados as categorias recebidas
			new Postagem(novaPostagem).save().then(()=>{
				req.flash("success_msg","Postagem Criada com Sucesso") // estou passando valores para as variaveis globais criadas no MIDDLEWARE
				res.redirect('/admin/postagens')
			}).catch((erro)=>{
				req.flash("error_msg","Falha ao se conectar, tente novamente a!!"+erro);
				res.redirect("/admin")
			})
		}
	})




// EDITAR POSTAGENS

	router.get("/postagens/edit/:id", eAdmin,(req,res)=>{
		Postagem.findOne({_id: req.params.id}).then((postagem)=>{
			Categoria.find().then((categorias)=>{
				res.render('admin/editpostagens',{categorias:categorias,postagem:postagem})
			}).catch((erro)=>{
				req.flash('error_msg',"Tente Novamente")
				res.redirect('/admin')
			})
		}).catch((erro)=>{
			req.flash('error_msg',"Tente Novamente, erro ao carregar o formulario")
			res.redirect('/admin')
		})
	}) 


// SALVANDO AS ALTERAÇÕES

	router.post('/postagens/edit',eAdmin,(req,res)=>{
		Postagem.findOne({_id: req.body.id}).then((postagem)=>{

			postagem.titulo = req.body.titulo
			postagem.slug = req.body.slug
			postagem.descricao = req.body.descricao
			postagem.conteudo = req.body.conteudo
			postagem.categoria = req.body.categoria

			postagem.save().then(()=>{
				req.flash('success_msg', "Postagem editada com sucesso")
				res.redirect("/admin/postagens")
			}).catch((erro)=>{
				res.flash("error_msg", "Falha ao salvar"+erro)
				res.redirect("/admin")	
			})

			


		}).catch((erro)=>{
			req.flash("error_msg","Houve um erro ao atualizar"+erro)
			res.redirect('/admin')
		})
	})


		// ROTA PARA DELETAR POSTAGEM

		router.post("/postagens/deletar",eAdmin, (req,res) =>{
			Postagem.remove({_id: req.body.id}).then(()=>{
				req.flash("success_msg", "Postagem deletada com sucesso")
				res.redirect("/admin/postagens")
			}).catch((erro)=>{
				res.flash("error_msg", "Houve um erro, tente novamente")
				res.redirect("/admin")
			})
		})


	


	// CRIO UM ARRAY DE ERROS VAZIO
	// FAÇO A VARIFICAÇÃO COM IF
	// CADA ERRO ADICIONA UM ITEM NO ARRAY VAZIO
	// FAÇO A VERIFICAÇÃO NO FINAL SE  O ARRAY VAZIO RECEBEU ALGUM ITEM






 



module.exports = router; 