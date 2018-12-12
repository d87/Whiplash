import express from "express"
import { User } from "../models"
import { check, validationResult } from "express-validator/check"
import passport from "passport"
import fs from "fs"
import jwt from 'jsonwebtoken'

const router = express.Router()

// const setJWTasCookieMiddleware = (req, res, next) => {
//     const jwt = req.user.generateJWT();
//     res.cookie('jwt', jwt, {
//         httpOnly: true,
//         // secure: true,
//     });
//     next();
// }

router.post(
    "/login",
    passport.authenticate("local"),

    function(req, res) {
        res.json(req.user.toUserDataJSON())
    }
)

// router.post(
//     "/login",
//     [
//         check("username", "Username is required")
//             .exists()
//             .isLength({ min: 1 }),
//         check("password", "Password is too short")
//             .exists()
//             .isLength({ min: 1 }),
//     ],
//     async (req, res, next) => {
//         const errors = validationResult(req)
//         if (!errors.isEmpty()) {
//             return res.status(422).json({ errors: errors.array() })
//         }
//         passport.authenticate("local", { session: false }, (err, user, info) => {
//             if (err) {
//                 return next(err)
//             }
//             if (!user) {
//                 // return res.redirect("/login")
//                 return res.status(401).json({ error: "Failed auth" })
//             }
//             req.login(user, { session: false }, err => {
//                 if (err) {
//                     return res.status(401).send(err)
//                 }
//                 // generate a signed son web token with the contents of user object and return it in the response
//                 return res.json(user.toAuthJSON())
//             })
//         })(req, res)
//     }
// )

// TODO: Store refersh token in cookies
router.post(
    "/token",
    async (req, res, next) => {
        const user_id = req.body.id
        const token = req.body.refreshToken
        User.findById(user_id)
            .then(user => {
                jwt.verify(token, user.refreshTokenKey, { ignoreExpiration: true, }, (err, payload) => {
                    if (err) {
                        return res.status(401).send(err)
                    }
                    return res.json(user.toAuthJSON())
                })
            })
            .catch(err => {
                console.log(err)
                return res.status(401).send(err)
            })
    }
)

router.post(
    "/register",
    [
        check("username", "Username is required")
            .exists()
            .isLength({ min: 1 }),
        check("email", "E-Mail is required")
            .exists()
            .isEmail(),
        check("password", "Password is too short")
            .exists()
            .isLength({ min: 5 }),
        check("password2")
            .exists()
            .custom((value, { req }) => value === req.body.password)
            .withMessage("Passwords are not matching"),
    ],
    async (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
        }

        const name = req.body.name
        const email = req.body.email
        const username = req.body.username
        const password = req.body.password

        const newUser = new User({
            username,
            name,
            email,
        })

        try {
            await User.checkUnique(newUser)
        } catch (err) {
            return res.render("register", { error: err })
        }

        await newUser.setPassword(password)
        newUser
            .save()
            .then(user => {
                console.log("authenticated", user)
                passport.authenticate("local")(req, res, () => res.redirect("/"))
            })
            .catch(err => {
                console.error(err)
                return res.render("register", { error: err }) // hmmmmmmmmm
            })
    }
)

export default router
