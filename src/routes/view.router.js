import { Router } from 'express';
import { __dirname } from "../utils.js"
import ProductManager from '../dao/products.manager.js';
import express from 'express';
import usersModel from '../models/users.model.js';

const router = express.Router();

const pManager = new ProductManager();


router.get('/', async (req, res) => {
    const listProducts = await pManager.getProducts();
    console.log({listProducts})
    res.render('home', {listProducts}) 
});


router.get('/realtimeproducts', (req, res) => {
    res.render('realtimeproducts', {
        user: res.locals.user,
        isAdmin: res.locals.user && res.locals.user.rol === "admin",  
    });

});


export default router;