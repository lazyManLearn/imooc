//入口文件
var express = require('express');
var mongoose=require('mongoose');
var underscore=require('underscore');
var port = process.env.PORT || 3000;
var app=express();
var bodyParser=require('body-parser');
var path=require('path');
var serveStatic=require('serve-static');
var Movie=require('./models/movie.js');
app.locals.moment=require('moment');
app.set('views','./views/pages');
app.set('view engine','jade');//注册模板引擎。

mongoose.connect('mongodb://localhost/imooc');
//这个express.static()还是可以用的.
//app.use(express.static(path.join(__dirname,'bower_components')));
app.use(serveStatic(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({extended:true}));
app.listen(port,function(){
    console.log('imooc started on port '+port);
});
//index page
app.get('/',function(req,res){
    Movie.fetch(function(err,movies){
        if(err){
            console.log('Error: '+err);
        }
        res.render('index',{
            title: 'imooc 首页',
            movies: movies
        })
    });
});

//detail page
app.get('/movie/:id',function(req,res){
    var id=req.params.id;
    Movie.findById(id,function(err,movie){
        if(err){
            console.log('Error: '+err);
        }
        res.render('detail',{
            title: 'imooc '+movie.title,
            movie: movie
        })
    });
});

//admin page
app.get('/admin/movie',function(req,res){
    res.render('admin',{
        title: 'imooc 后台录入页',
        movie: {
            title: '',
            doctor: '',
            country: '',
            year: '',
            poster: '',
            flash: '',
            summary: '',
            language: ''
        }
    })
});
//admin post movie
app.post('/admin/movie/new',function(req,res){
    var id=req.body.movie._id;
    var movieObj=req.body.movie;
    var _movie=null;
    if(id!=='undefined'){
        Movie.findById(id,function(err,movie){
            if(err){
                console.log('Error: '+err);
            }
            _movie=underscore.extend(movie,movieObj);
            _movie.save(function(err,movie){
                if(err){
                    console.log('Error: '+err);
                }
                res.redirect('/movie/'+_movie._id);
            });
        });
    }else{
        _movie=new Movie({
            doctor: movieObj.doctor,
            title: movieObj.title,
            country: movieObj.country,
            language: movieObj.language,
            year: movieObj.year,
            poster: movieObj.poster,
            summary: movieObj.summary,
            flash: movieObj.flash
        });
        _movie.save(function(err,movie){
            if(err){
                console.log('Error: '+err);
            }
            res.redirect('/movie/'+_movie._id);
        });
    }
});


//list page
app.get('/admin/list',function(req,res){
    Movie.fetch(function(err,movies){
        if(err){
            console.log('Error: '+err);
        }
        res.render('list',{
            title: 'imooc 列表页',
            movies:movies
        })
    });

});

//admin movie update
app.get('/admin/update/:id',function(req,res){
    var id=req.params.id;
    if(id){
        Movie.findById(id,function(err,movie){
            res.render('admin',{
                title:'imooc 后台更新页',
                movie: movie
            })
        })
    }
});
//list delete movie
app.delete('/admin/list',function(req,res){
    var id=req.query.id;
    if(id){
        Movie.remove({_id:id},function(err,movie){
            if(err){
                console.log('Error: '+err);
            }
            res.json({
                success: 1
            })
        })
    }
});

