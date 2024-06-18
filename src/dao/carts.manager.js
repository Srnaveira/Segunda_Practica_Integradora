
import ProductManager  from './products.manager.js'
import cartsModel from '../models/carts.model.js';

const pManagment = new ProductManager();

class CartsManagment{

    async addCart(){
        try {
            const newCart = {
                product: []
            }
            const cartNew = await cartsModel.create(newCart);
            console.log("Se agrego correctamente el carrito")
            return cartNew;
        } catch (error) {
            console.error("Se produjo algun error al agregar el carrito", error);
            throw error;
        }
    }

    async addProductToCart(idCart, idProduct, quantity){
        try {

            const cartCheck = cartsModel.findOne({_id: idCart})

            if(!cartCheck){
                console.log(`El carrito ingrsado ${idCart} no existe`);
                throw new Error({message: "El carrito ingresado no existe"});
            }

            //llamo a la funcion para ver si existe algun producto con ese id
            const productCheck = await pManagment.getProductById(idProduct);

            if(productCheck){
                //como existe un producto con ese id llama a la funcion para comporbar si ese producto ya esta ingresado en ese carrito
                const existingCart = await cartsModel.findOne({ _id: idCart, "product.idP": idProduct });
                console.log({existingCart})
                if (existingCart) {
                    // Actualizar la cantidad si el producto existe
                    await cartsModel.updateOne(
                        { _id: idCart, "product.idP": idProduct },
                        { $set: { "product.$.quantity": existingCart.product[0].quantity + quantity } }
                    );
                } else {
                    // Agregar el producto al carrito si no existe
                    await cartsModel.updateOne({ _id: idCart }, { $push: { product: { idP: idProduct, quantity } } });
                }
            } else {
                console.log("El producto Ingresado no existe");
                throw new Error({message: `El producto id ingresado: ${idProduct} no existe`})
            }
            
        }
        catch (error) {
            console.error("Se produjo un error al agregar el Producto al carrito", error);
            throw error;
        }
    }

    async getCartProducts(idCart){
        try {
            const cartCheck = cartsModel.findOne({_id: idCart});
            if(cartCheck){
                console.log(`Contenido del carrito con ID ${idCart}:`, cartCheck.product);
                return cartCheck;
            } else {
                console.log("El ID de carrito ingresado no pertenece a ningun carrito")
                throw new Error({message: `El id del cart ingresado: ${idCart} no existe`})
            }
        } catch (error) {
            console.error("Error al buscar el carrito", error);
            throw error;
        }
    }

    async getCartContById( idCart, idProduct ){
        try {
            const existingCart = await cartsModel.findOne({ _id: idCart, "product.idP": idProduct });

            if (existingCart){
                return existingCart;
    
            } else {
                return null;
                
            }               
        } catch (error) {
            console.error("Error al buscar el cart y product", error);
            throw error;
        }

    }

    async getAllCarts(){
        try {
            const cartContent = await this.loadCarts();
            return cartContent;
        } catch (error) {
            console.error("se produjo algun Erro", error)
        }

    }
    async loadCarts(){
        try {
                const cartsContent = await cartsModel.find();
                return cartsContent
        } catch (error) {
            console.error("Error al leer el archivo", error)
        }
    }  
  
    async deleteProductByCart(idCart, idProduct){
        try {
            const product = await this.getCartContById( idCart, idProduct);
            if(product){
                await cartsModel.updateOne(
                    { _id: idCart },
                    { $pull: { product: { idP: idProduct } } }
                );
                console.log(`Producto con ID ${idProduct} eliminado del carrito con ID ${idCart}.`);
            } else {
                console.log(`No se encontró el producto con ID ${idProduct} en el carrito con ID ${idCart}.`);
                throw new Error({message:`No se encontró el producto con ID ${idProduct} en el carrito con ID ${idCart}.`})
            }
        } catch (error) {
            console.error('Error al eliminar el producto:', error)
        }

    }

    async deleteCart(idCart){
        try {
           const cartCheck = await cartsModel.findOne({_id: idCart})
           
           if(cartCheck){
                await cartsModel.deleteOne({_id: idCart})
                console.log(`Se elimino correctamente el Cart ${idCart}`)
           } else {
             throw new Error({message: `No existe un Cart con ese ID: ${idCart}`})
           
            }
        } catch (error) {
            console.error('Error al eliminar el Cart:', error)
            throw error;
        }
    }


}

   

export default CartsManagment;