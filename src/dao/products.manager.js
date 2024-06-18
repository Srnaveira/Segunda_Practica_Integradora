import productsModel from '../models/products.model.js'

class ProductManager {

    async addProduct(product) {
        try {
            //Chequeo con la funcion que el producto tenga todo los campos
            const codeIsValid = await productsModel.findOne({code: product.code})
            
            if(codeIsValid){
                console.log("El code ya se encuentra en uso")
                throw new Error(`message: El code: ${product.code} ya se encuentra en uso.`);;
            } else {
                const newProduct = {
                    title: product.title,
                    description: product.description,
                    price: product.price,
                    thumbnail: product.thumbnail,
                    code: product.code,
                    status: product.status,
                    category: product.category,
                    stock: product.stock
                }

                const productAdd = await productsModel.create(newProduct)
                if(productAdd){
                    console.log("producto agregado correctamente");   
                } else {
                    console.log("parece que hubo algun error en algunos de los campos ingresados")
                    throw new Error({message: "Error en alguno de los campos del producto"})
                }                
            }

        } catch (error) {
            console.error("No se pudo agregar el producto", error);
            throw error;
        }
    
    }

    async loadProducts() {
        try {
            const products = await productsModel.find({});
            return products;
        } catch (error) {
            console.error("hubo un problema al cargar los productos")
            throw error  
        } 
    }

    async getProducts(){
            const products = await this.loadProducts();
            console.log(products);
            const plainObj = products.map(doc => doc.toJSON());
            console.log(plainObj);
            return plainObj;
    }

    async getProductById(id) {
        
        const getProduct = await productsModel.findOne({_id: id})
        if(!getProduct){
            console.log(`El id ingresado: ${id} no corresponde a ningun id de productos`);
            return;
        }
        console.log(getProduct);
        return getProduct;
    }

    async updateProduct(id, infoUpdate){
        try {
            let productUpdate = await productsModel.updateOne({ _id: id }, infoUpdate)
            if (!productUpdate) {
                console.log(`No se encontró ningún producto con id ${id}.`);
                //return; <== se cambio el return por esta el throw new Error....
                throw new Error(`message: No se encontro ese producto`);    
            }
            console.log("Producto actualizado correctamente.");
        } catch (error) {
            console.error("No se pudo actualizar el producto:", error);
            //linea agregada para manejo de errores
            throw error;                
        }

    }

    async deleteProduct(id){
        try {
            const productDelete = await productsModel.deleteOne({ _id: id })

            if(productDelete){
                console.log(`El producto con ID: ${id}, se ha borrado correctamente.`)   
                return
            } else {
                console.log(`El producto id ingresado: ${id} no existe`)
                throw new Error(`message: El producto id ingresado: ${id} no existe`);;
            }
            
        } catch (error) {
            console.error("Dio este mensaje de error ", error);
            throw error;
        }
    }

    async getProductsByFilter(limit, page, sort, query, user){
        try {  
            let filter = {};
            if(query){
                filter = {
                    $or: [
                        { category: query },
                        { status: query.toLowerCase() === 'true' } // Comparar como booleano
                    ]
                };
            }

                 // Opciones de sorteo
            let sortOptions = {};
            if (sort) {
               sortOptions.price = sort === 'asc' ? 1 : -1;
            }

            // Obtener el total de productos que coinciden con el filtro
            const totalProducts = await productsModel.countDocuments();
            // Calcular la paginación
            const totalPages = Math.ceil(totalProducts / limit);
            const offset = (page - 1) * limit;

            // Obtener productos paginados

            const products = await productsModel.find(filter)
                .sort(sortOptions)
                .skip(offset)
                .limit(limit)
                .lean()
            //console.log(products)
            // Construir la respuesta
            const response = {
                status: "success",
                isUser: !!user,
                payload: products,
                totalPages,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < totalPages ? page + 1 : null,
                page,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
                prevLink: page > 1 ? `/api/products?limit=${limit}&page=${page - 1}&sort=${sort || ''}&query=${query || ''}` : null,
                nextLink: page < totalPages ? `/api/products?limit=${limit}&page=${page + 1}&sort=${sort || ''}&query=${query || ''}` : null
            };

            return response;

        } catch (error) {
            console.error("hubo algun error al filtrar los ´productos")
            throw error;
        
        }
    }

}

export default ProductManager;