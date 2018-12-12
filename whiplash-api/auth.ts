import passport from "passport"
import { User, RSA_PRIVATE_KEY } from "./models"
import { Strategy as LocalStrategy } from "passport-local"
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt' // or use 'express-jwt'

export const authStrategy = new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }).exec((err, user) => {
        if (err) {
            return done(err)
        }
        if (!user) {
            return done(null, false, { message: "Incorrect username." })
        }
        if (!user.validatePassword(password)) {
            return done(null, false, { message: "Incorrect password." })
        }
        return done(null, user)
    })
})

export const jwtStrategy = new JWTStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: RSA_PRIVATE_KEY,
    },
    (jwtPayload, done) => {
        return User.findById(jwtPayload.id).exec((err, user) => {
            if (err) return done(err)
            return done(null, user)
        })
    }
)


export const serializeUser = (user, done) => {
    done(null, user.id)
}

export const deserializeUser = (id, done) => {
    User.findById(id, (err, user) => {
        done(err, user)
    })
}
