//Librerias y variables
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import dotenv from 'dotenv';
import { __dirname } from './utils.js';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import initializePassport from './config/passport.config.js';
//Managments
import ProductManager from './dao/products.manager.js';
import CartsManagment from './dao/carts.manager.js';
//Routes
import cartsRouter from './routes/carts.router.js';
import productsRouter from './routes/products.router.js';
import viewRoutes from './routes/view.router.js';
import usersRoutes from './routes/users.router.js';
import seccionsRoutes from './routes/sessions.router.js';

const app = express()

dotenv.config()

app.engine('hbs', engine({
        extname: '.hbs',
        defaultLayout: 'main',
}));

app.set('view engine', 'hbs');

app.set('views', __dirname + '/views');
app.use(express.static(__dirname+'/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
        secret: 'D3MUS1C4l1g3r4',
        resave: false,
        saveUninitialized: false,
        cookie: {
                secure: false,
                path: '/',
                expires: new Date(Date.now() + (25000)), 
                maxAge: 25000
        }
}));

initializePassport()
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
        res.locals.user = req.session.user || null;
        next();
});

app.use('/api/products/', productsRouter);
app.use('/api/carts/', cartsRouter);
app.use('/api/admin/', viewRoutes)
app.use('/api/users/', usersRoutes)
app.use('/api/sessions/', seccionsRoutes)


const httpServer = app.listen(process.env.PORT, () =>{
    console.log(`Listening on PORT: ${process.env.PORT}`)
})

mongoose.connect(process.env.MONGO_URL)
    .then(() =>{ console.log("Conexion sucefull")})
    .catch((error) => {console.error("Error en conexion con la BD", error)})


const socketServer = new Server(httpServer);

const pManager = new ProductManager();
const cManager = new CartsManagment();

socketServer.on('connection', socket =>{
    console.log("Nuevo cliente conectado");

        socket.on('message', data =>{
                console.log(data);
        })
    
        pManager.loadProducts()
          .then((products) =>{
                socket.emit('listProducts', products)
        })       
    
        socket.broadcast.emit('message_user_conect', "Ha Ingresado un nuevo USUARIO")
        socketServer.emit('event_for_all', "Este evento lo veran todos los usuarios")

    
        socket.on('productAdd', async (product) =>{
            try {
                   const addIsValid = await pManager.addProduct(product)
                   if(addIsValid){
                            await pManager.loadProducts()
                            .then((products) =>{
                                    socket.emit('listProducts', products);
                                    socket.emit('message_add', "Producto Agregado")
                            })      
                    }
            } catch (error) {
                    socket.emit('message_add', "Error al agregar el producto: " + error.message)
            }
        })
    
        socket.on('productDelete',  async (pid) =>{
            try {
                    const Productexist = await pManager.getProductById(pid)
    
                    if(Productexist){
                            await pManager.deleteProduct(pid)
                            await pManager.loadProducts()
                            .then((products) =>{
                                    socket.emit('listProducts', products);
                                    socket.emit('message_delete', "Producto Eliminado")
                          })  
                    }
            } catch (error) {
                    socket.emit('message_delete', "Error al Eliminar el producto: " + error.message)
    
            }

        })
            
        socket.on('add_Product_cart', async (productId) => {
                try {
                     const quantity = 1;   
                     //const listCarts = await cManager.loadCarts()   
                     //const producID = productId._id     
                     //const CartId = await cartsModel.findById(productId.cartId)
                     //const randomCart = Math.floor(Math.random() * listCarts.length);
                     //const cartAdd = listCarts[randomCart]

                     await cManager.addProductToCart(productId.cartId , productId._id, quantity)
                     socket.emit('productAdded', { message: "El producto se agrego correctamente" });
                } catch (error) {
                     socket.emit('productAdded', "Error al agregar el producto al cart selecionado: " + error.message)  
                }
        })
})

