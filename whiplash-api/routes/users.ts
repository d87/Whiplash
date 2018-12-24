import express from "express"
import { User } from "../models"
import passport from "passport"
import fs from "fs"
import jwt from 'jsonwebtoken'
import * as yup from "yup"




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

export const registrationValidationSchema = yup.object().shape({
    username: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
    password2: yup.string()
            .oneOf([yup.ref('password'), null])
            .required('Password confirm is required')
})

router.post(
    "/register",
    async (req, res, next) => {

        try {
            const isValid = registrationValidationSchema.validateSync(req.body)
        } catch(errors) {
            return res.status(422).json({ errors: errors })
        }

        const { name, email, username, password } = req.body
        

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
