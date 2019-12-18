if(process.env.NODE_ENV == "production"){
	module.exports = {
		mongoURI:"mongodb+srv://jflorescalado:Joao1992@blogapp-lbu5r.mongodb.net/test?retryWrites=true&w=majority"
	}
}else{
	module.exports = {
		mongoURI:"mongodb://localhost/blogapp"
	}
}



