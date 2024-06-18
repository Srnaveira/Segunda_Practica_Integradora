import express from 'express';
import { Router } from 'express'
import CartsManagment from '../dao/carts.manager.js'
import cartsModel from '../models/carts.model.js';
import mongoose from 'mongoose';

const router = express.Router()

const cManager = new CartsManagment();

router.post('/', async (req, res)=>{
    try {
        const newCart = await cManager.addCart()
        res.status(201).json({message:'Se a creado correctamente el nuevo cart', cart: newCart});
    } catch (error) {
        console.error("Se produjo algun error al generar el Cart", error);
        res.status(500).json({message: "Error interno del servidor", error: error});
    }
})


router.get('/', async (req, res)=>{
    try {
        const cartContent = await cManager.getAllCarts();
        res.status(200).json({message: "Se envio el contenido de todos los carritos", cart: cartContent});
    } catch (error) {
        console.error("Se produjo algun error al traer el contenido del Cart", error);
        res.status(500).json({message: "Error interno del servidor", error: error});
    }
})


router.get('/:cid', async (req, res)=>{
    try {
        const cartId = req.params.cid;
        const cartContent = await cartsModel.findOne({_id: cartId}).populate('product.idP').lean();
        if(cartContent){
            res.status(200).render('cart', cartContent);
        } else {
            res.status(404).json({message: "No existe ese producto"});
        }
    } catch (error) {
        console.error("Se produjo algun error al traer el contenido del Cart", error);
        res.status(500).json({message: "Error interno del servidor", error: error});
    }
})


router.post('/:cid/product/:pid', async (req, res)=>{
    try {
        const cartId = req.params.cid;
        const productid = req.params.pid;
        const quantity = 1;
        await cManager.addProductToCart(cartId, productid, quantity);
        res.status(200).json({message: "Producto agregado correctamente"})
    } catch (error) {
        console.error("Hubo un problema al agregar ese producto", error)
        res.status(404).json({message: "Producto o carrito no encontrado", error: error})
    }
})


router.delete('/:cid/product/:pid', async (req, res)=>{
    try {
        const cartId = req.params.cid;
        const productid = req.params.pid;
        await cManager.deleteProductByCart(cartId, productid)
        res.status(200).json({message: "Producto Eliminado correctamente"})
    } catch (error) {
        console.error("Hubo un problema al eliminar ese producto", error)
        res.status(404).json({message: "Producto o carrito no encontrado", error: error})
    }
})


router.put('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const infoUpdate = parseInt(req.body.quantity);

        console.log(cartId);
        console.log(productId);
        console.log(infoUpdate);

        const cartCheck = await cartsModel.findById(cartId);

        console.log({ cartCheck });

        if (cartCheck) {
            const existingProduct = cartCheck.product.find(p => p.idP.toString() === productId);

            console.log({ existingProduct });

            if (existingProduct) {
                // El producto ya existe en el carrito, actualiza la cantidad
                existingProduct.quantity = infoUpdate;
                await cartCheck.save();
                console.log({ existingProduct });
                res.status(200).json({ message: "Producto del Carrito Actualizado correctamente" });
            } else {
                // Agregar el producto al carrito si no existe
                cartCheck.product.push({ idP: new mongoose.Types.ObjectId(productId), quantity: infoUpdate });
                await cartCheck.save();
                res.status(200).json({ message: "Producto se agregó correctamente" });
            }
        } else {
            console.log(`El Carrito ID: ${cartId} ingresado no existe`);
            res.status(404).json({ message: "No existe ese carrito" });
        }
    } catch (error) {
        console.error("Se produjo un error", error);
        res.status(500).json({ message: "Error interno del servidor", error: error });
    }
});


router.delete('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        await cManager.deleteCart(cartId);
        res.status(200).json({message: "carrito Eliminado correctamente"})
    } catch (error) {
        console.error("Hubo un problema al eliminar ese carrito", error)
        res.status(404).json({message: "carrito no encontrado", error: error})       
    }
})


export default router;