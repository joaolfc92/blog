// ARQUIVO PRINCIPAL

// CARREGANDO MODULOS 
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const admin = require('./routes/admin') // importando o arquivo admin.js- arquivo de rotas
const path = require('path'); // modulo para trabalhar com diretorios ---- carregar arquivos estaticos   
const session = require('express-session');
const flash = require('connect-flash');
require('./models/Postagem');
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
const usuarios = require('./routes/usuario')
const passport = require('passport')
require('./config/auth')(passport)



// CONFIGURAÇÕES
	// app.use - seve para criação e configuração de middlewares
  
	// BODY PARSER

	app.use(bodyParser.urlencoded({extended:true}));
	app.use(bodyParser.json());

	// HANDLEBARS 
 
	app.engine('handlebars',handlebars({defaultLayout:'main'}));
	app.set('view engine', 'handlebars');

	// SESSÃO
		app.use(session({
			secret: "chaveapp", // chave para criação da session
			resave: true,
			saveUnitialized: true 
		}));

		// inializando o passport
		app.use(passport.initialize())
		app.use(passport.session())
		 
	// FLASH  
		   
		 app.use(flash());  

	//MIDDLEWARE  
		
		 app.use((req,res,next)=>{
			 res.locals.success_msg = req.flash('success_msg')// locals serve para criar variaveis globais
			 res.locals.error_msg = req.flash('error_msg')
			 res.locals.error = req.flash('error')
			 res.locals.user = req.user || null;
			 next();
			})
		  

// MONGOOSE 
		mongoose.Promise = global.Promise // variavel que evita error

		// conectando ao banco de dados (mongobd / localhost / nome do banco a ser criado)
		mongoose.connect("mongodb://localhost/blogapp", {useNewUrlParser: true}).then(()=>{
			console.log('conectado ao banco')
		}).catch((erro)=>{
			console.log('Erro na conexão: '+erro)
		})
 
// PUBLIC - CSS/JS/IMG 

	app.use(express.static(path.join(__dirname,"public")))	// estou dizendo para o express que esse e o caminho do meus arqiovos estaticos



// ROTAS 

	app.get('/', (req,res)=>{
		Postagem.find().populate("categoria").sort({data:"desc"}).limit(5).then((postagens)=>{
			res.render("index", {postagens:postagens})
		}).catch((erro)=>{
			req.flash("error_msg","Erro ao carregar post")
			res.redirect("/404"+erro)
		})
		
	})

	app.get("/404", (req,res)=>{
		res.send('Erro 404!!')
	})

	app.use('/admin', admin) // criando a rota com prefixo admin para todas as paginas admin/alguma coisa , nome da constante que importa o arquivo
	app.use('/usuarios', usuarios) // criando rota para os usuarios


	// rota para ao clicar na postagem na home ser direcionado para pagina com ela
	app.get("/postagem/:slug", (req,res)=>{
		Postagem.findOne({slug: req.params.slug}).then((postagem)=>{
			if(postagem){
				res.render("postagem/index" ,{postagem:postagem})
			}else{
				req.flash("error_msg","Está postagem não existe")
				res.redirect('index')
			}
		}).catch((error)=>{
			res.flash("Error interno"+error)
			res.redirect('/404');
		})
	})


	// rota para pagina com lista de categorias

	app.get('/categorias', (req,res)=>{
		Categoria.find().then((categorias)=>{
			res.render('categorias/index', {categorias:categorias})
		}).catch((erro)=>{
			req.flash('error_msg', "Houve um erro"+erro)
			res.redirect('/index')
			})
	})


	// rota na pagina de lista de categorias eu clicar e ser redirecionado a todos os posts daquela categoria

	app.get("/categorias/:slug", (req,res)=>{
		Categoria.findOne({slug: req.params.slug}).then((categoria) =>{

			if(categoria){

				Postagem.find({categoria: categoria._id}).then((postagens)=>{

					res.render('categorias/postagens', {postagens:postagens, categoria:categoria})

				}).catch((erro)=>{
					req.flash('error_msg',"Erro ao listar Post"+erro)
				res.redirect('/')
				})
			}else{
				req.flash('error_msg',"Essa categoria não existe")
				res.redirect('/')
			}
		}).catch((error)=>{
			req.flash('error_msg', "houve um erro interno"+erro)
			res.send('/404');
		})
	}) 






// OUTROS

//Config PORTA DO SERVIDOR

const PORT = process.env.PORT || 8081;
app.listen(PORT,()=>{
	console.log('servidor rodando na http://localhost:8081');   
})