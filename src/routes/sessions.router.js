import { Router } from 'express';
import passport from 'passport';

const router = Router();


router.post('/register', passport.authenticate('register', { failureRedirect: 'failregister' }), async (req, res) => {
    try {
        console.log({ status: "success", message: "Usuario registrado" })
        res.status(200).redirect('/api/users/login');
    } catch (err) {
        res.status(500).send('Error al registrar usuario');           
    }
});


router.get('/failregister', async (req, res) => {
    console.log("Failed Strategy")
    res.send({ error: "Failed" })
})

router.post('/login', passport.authenticate('login', { failureRedirect: 'faillogin' }), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(400).send({ status: 'error', error: "Invalid credentials" })
        } 
        
        
        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            age: req.user.age,
            email: req.user.email,
            rol: req.user.rol,
            cartId: req.user.cartId
        }
       
        
        if(req.session.user.rol === "user"){
            res.status(200).redirect('/api/products/');
        } else {
            res.status(200).redirect('/api/admin/realtimeproducts');
        }
        
    } catch (err) {
        res.status(500).send('Error al iniciar sesión');
    }
});


router.get('/faillogin', (req, res) => {
    res.send({ error: "Falied login" })
})

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error al cerrar sesión');
        } else {
            res.clearCookie('connect.sid').redirect('/api/users/login');
        }                 
    });
});

router.get("/github", passport.authenticate("github",{scope:["user:email"]}),async(req,res)=>{})


router.get("/githubcallback",passport.authenticate("github",{failureRedirect:"/login"}),async(req,res)=>{
    req.session.user=req.user
    res.status(200).redirect('/api/products/');
})


export default router;
