const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcryptjs')
const mysql = require('mysql');
const app = express();

const http = require('http').createServer(app)

const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database: 'node',
})

// const connection = mysql.createConnection({
//     host:'localhost',
//     user:'subhamap_root',
//     password:'9wdTUs=gKn~=',
//     database: 'subhamap_node',
// })

app.use(session({
    secret: uuidv4(), //  '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
    resave: false,
    saveUninitialized: true
}));



connection.connect(function(error){
    if(!!error) console.log(error);
    else console.log('database connected');
})

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
    // res.send({
    //     title: 'CRUD Operation'
    // });
    let sql = "SELECT * FROM user";
    let query = connection.query(sql, (err, rows) => {
        if(err) throw err;
        res.render('user_index', {
            title:'CRUD',
            user: rows
        })
    })
    
})

app.get('/add', (req, res) => {

        res.render('user_add', {
            title:'CRUD',
            
        })

    
})

app.post('/save', (req, res) => {

    let data = {name: req.body.name, phone:req.body.phone};
    let sql = "INSERT INTO user SET ?";
    connection.query(sql, data, (err, results) => {
        if (err) throw err; 
            res.redirect('/');
    })
    
})

app.get('/edit/:userId', (req, res) => {

    const userId = req.params.userId;
    let sql = `Select * from user where id = ${userId}`;
    let query = connection.query(sql, (err, result) =>{
        if(err) throw err;
        res.render('user_edit', {
            title:'CRUD',
            item: result[0]
            
        })
    })

})

app.post('/update/:userId', (req, res) => {

    const userId = req.params.userId;

    
    let sql = `update user set name='${req.body.name}', phone='${req.body.phone}' where id=${userId}`;
    connection.query(sql,  (err, results) => {
        if (err) throw err; 
            res.redirect('/');
    })
    
})


app.get('/delete/:userId', (req, res) => {

    const userId = req.params.userId;

    
    let sql = `delete from user where id=${userId}`;
    connection.query(sql,  (err, results) => {
        if (err) throw err; 
            res.redirect('/');
    })
    
})

app.get('/chat', (req, res) => {

    if(req.session.user){
        let sqlGet = `Select * from user_chat where id = "${req.session.user}"`;
        connection.query(sqlGet, (err, result) =>{
            if(err) throw err;
            let user = result[0];
            let sqlMsg = `Select * from chat_message`;
            connection.query(sqlMsg, (err, result) =>{
                if(err) throw err;
                message = result
                res.render('chat', {
                    title:'CHAT',
                    user: user,
                    message: message
                    
                })
            })
           
        })

        
    }else{
        res.redirect('/chat/login')
    }


})

app.get('/chat/login', (req, res) => {

    if(req.session.user){
        res.redirect('/chat')
    }else{

    res.render('login', {
        title:'Chat-login',
        error: null
    })

    }


})

app.post('/chat/login', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    if(email.length == 0 || password.length == 0 ){
            
            
        res.render('login', {
            title:'Chat-login',
            error:"All fields are to be field!!"
        })

    }else{
            
            let sqlGet = `Select * from user_chat where email = "${email}"`;
            connection.query(sqlGet, (err, result) =>{

                if(err){
                    res.render('login', {
                        title:'Chat-login',
                        error:"Something went wrong. Please try again"
                    })
                    throw err;
                }else{
                    if(result.length==1){
                        if(bcrypt.compareSync(password, result[0].password)){
                            req.session.user = result[0].id;
                            res.redirect('/chat')
                        }else{
                            res.render('login', {
                                title:'Chat-login',
                                error:"Enter valid password"
                            })
                        }
                        
                    }else{
                        res.render('login', {
                            title:'Chat-login',
                            error:"Enter valid email "
                        })
                    }
                }

            })
    }


})

app.get('/chat/register', (req, res) => {
    if(req.session.user){
        res.redirect('/chat')
    }else{
    res.render('register', {
        title:'Chat-register',
        error:null,
    })
    }


})

app.post('/chat/register/', (req, res) => {

        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const cpassword = req.body.cpassword;

        if(name.length == 0 || email.length == 0 || password.length == 0 || cpassword.length == 0 ){
            
            
              res.render('register', {
                title:'Chat-register',
                error:"All fields are to be field!!"
            })

        }else if(password !== cpassword){

            res.render('register', {
                title:'Chat-register',
                error:"Both the passwowrd fields should be same"
            })
            
            
        }else{
            const hashPassword = bcrypt.hashSync(password, 10);
            let data = {name, email, password: hashPassword};
            let sqlGet = `Select * from user_chat where email = "${email}"`;
            connection.query(sqlGet, (err, result) =>{
                if(err){
                    res.render('register', {
                        title:'Chat-register',
                        error:"Something went wrong. Please try again"
                    })
                }else{
                    if(result.length==0){

                        let sqlPost = "INSERT INTO user_chat SET ?";
                        connection.query(sqlPost, data, (err, results) => {
                            if (err){
                                res.render('register', {
                                    title:'Chat-register',
                                    error:"Something went wrong. Please try again"
                                })
                            }else{
                                res.redirect('/chat/login');
                            }
                        })

                    }else{
                        res.render('register', {
                            title:'Chat-register',
                            error:"Email ID already exists"
                        })
                    }
                }
               
            })
            
        }  
    
})

app.get('/chat/logout', (req ,res)=>{
    req.session.destroy(function(err){
        if(err){
            console.log(err);
            res.send("Error")
        }else{
            res.redirect('/chat/login');
        }
    })
})

//socket

const io = require('socket.io')(http);

io.on('connection', (socket) =>{

    console.log('user connected');

    socket.on('message', (msg) => {
        socket.broadcast.emit('message',msg)
        storeMessage(msg)
    })

    socket.on('typing', (type) => {
        socket.broadcast.emit('typing',type)
    })


});

const storeMessage = (msg) =>{
    console.log(msg)
    let name = msg.user;
    let message = msg.message
    let user_id = msg.user_id
    let data = {name, message, user_id}
    let sql = "INSERT INTO chat_message SET ?";
    connection.query(sql, data, (err, results) => {
        if (err) throw err; 
            console.log(results)
    })
}

//server listening
http.listen(3000, () => {
    console.log('server is running on port 3000');
});