import passport from "passport";
import local from 'passport-local'
import usersModel from '../models/users.model.js'
import { createHash, isValidPassword } from '../config/bcrypt.js'
import CartsManagment from "../dao/carts.manager.js";
import dotenv from 'dotenv';

const cartM = new CartsManagment();

dotenv.config()
const LocalStrategy = local.Strategy

const initializePassport = () => {
    passport.use('register', new LocalStrategy(
        { passReqToCallback: true, usernameField: "email" }, async (req, username, password, done) => {
            const { first_name, last_name, email, age } = req.body
            try {
                let user = await usersModel.findOne({ email: username })
                if (user) {
                    console.log("User already exists")
                    return done(null, false)
                }
                const CartId = await cartM.addCart()
                console.log({CartId})

                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password),
                    cartId: CartId._id
                }
                console.log(newUser);

                let result = await usersModel.create(newUser)
                return done(null, result)
            } catch (error) {
                return done("Error getting the user" + error)
            }
        }
    ))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        let user = await usersModel.findById(id)
        done(null, user)
    })

    passport.use('login', new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
        try {
            const user = await usersModel.findOne({ email: username })
            if (!user) {
                console.log("User doesn't exists")
                return done(null, false)
            }
            if (!isValidPassword(user, password)) return done(null, false)
            console.log(user)
            return done(null, user)
        } catch (error) {
            return done(error)
        }
    }))
}

export default initializePassport