import createError from "http-errors"
import express from "express"
import path from "path"
import cookieParser from "cookie-parser"

import morgan from "morgan"
// import jsend from "jsend"
// import jwt from 'jsonwebtoken'
import session from "express-session"
import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import connectRedis from "connect-redis"
import nunjucks from "nunjucks"
import graphqlHTTP from "express-graphql"

// var indexRouter = require('./routes/index');
import indexRouter from "./routes/index"
// import scheduleTaskRouter from './routes/tasks'
import todoRouter from "./routes/todos"
import usersRouter from "./routes/users"
import { startDailyResetJob } from './cronjobs'

import { schema } from "./schema"
import { authStrategy, jwtStrategy, serializeUser, deserializeUser } from "./auth"


const app = express()

const env = app.get("env")

// view engine setup
nunjucks.configure("views", {
    autoescape: true,
    express: app
})
app.set("view engine", "html")

app.use(morgan("dev"))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.json())

app.use("/static", express.static(path.join(__dirname, 'static')))

const halfYear = 31536000 * 0.5 * 1000

const RedisStore = connectRedis(session)
export const sessionParser = session({
    secret: "ripp0-in-pepproni",
    store: new RedisStore({}),
    saveUninitialized: true,
    resave: true,
    cookie: {
        httpOnly: true,
        maxAge: halfYear
    }
})
app.use(sessionParser)
app.use(passport.initialize())
app.use(passport.session())
passport.use("local", authStrategy)
// passport.use('jwt', jwtStrategy);
passport.serializeUser(serializeUser)
passport.deserializeUser(deserializeUser)
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// app.use(jsend.middleware)

app.use("/", indexRouter)
app.use("/users", usersRouter)
startDailyResetJob()
// app.use('/users', passport.authenticate('jwt', {session: false}), usersRouter);

app.use(
    "/api/graphql",
    graphqlHTTP(async (req, res, graphQLParams) => {
        // console.log("gql user = ", req.user)
        return {
            schema: schema,
            graphiql: true,
            context: {
                user: req.user
            },
            formatError: error => ({
                message: error.message,
                // locations: error.locations,
                // stack: error.stack ? error.stack.split("\n") : [],
                // path: error.path
            })
        }
    })
)

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get("env") === "development" ? err : {}

    console.error(err)

    // render the error page
    res.status(err.status || 500)
    res.render("error.html")
})

// const errorHandlerConfig = app.get('env') === 'development' ? { dumpExceptions: true, showStack: true } : {}
// app.use(express.errorHandler(errorHandlerConfig));

export default app
