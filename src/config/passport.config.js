import passport from "passport";
import local from 'passport-local'
import GitHubStrategy from 'passport-github2'
import usersModel from '../models/users.model.js'
import { createHash, isValidPassword } from '../config/bcrypt.js'
import dotenv from 'dotenv';
import CartsManagment from "../dao/carts.manager.js";

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

    passport.use('github', new GitHubStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile)
            let user = await usersModel.findOne({ email: profile._json.email })
            if (!user) {
                let newUser = {
                    first_name: profile._json.name,
                    last_name: "Github",
                    age: 20,
                    email: profile._json.email,
                    password: "Github"
                }
                let result = await usersModel.create(newUser)
                done(null, result)
            }
            else {
                done(null, user)
            }
        } catch (error) {
            return done(error)
        }
    }))


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
            return done(null, user)
        } catch (error) {
            return done(error)
        }
    }))
}

export default initializePassport