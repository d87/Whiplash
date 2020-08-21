import createError from "http-errors"
import express from "express"
import path from "path"
import cookieParser from "cookie-parser"
import { v4 as uuidv4 } from 'uuid'
import morgan from "morgan"
import cors from "cors"
// import jsend from "jsend"
// import jwt from 'jsonwebtoken'
import session from "express-session"
import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import redis from "redis"
import connectRedis from "connect-redis"
import nunjucks from "nunjucks"
import { graphqlHTTP } from "express-graphql"
import { GraphQLError } from "graphql";
import usersRouter from "./routes/users"
import { scheduleDailyResets, resetTasks } from './cronjobs'

import { schema } from "./schema"
import { authStrategy, jwtStrategy, serializeUser, deserializeUser } from "./auth"
import { logger } from "./logger";


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

// app.use(cors())

app.use("/static", express.static(path.join(__dirname, 'static')))

const halfYear = 31536000 * 0.5 * 1000

const redisClient = redis.createClient({
    // host: 'localhost',
    // port: 6379,
    // password: 'my secret',
    // db: 1,
})
redisClient.unref()
redisClient.on('error', console.log)

const RedisStore = connectRedis(session)
export const sessionParser = session({
    secret: "ripp0-in-pepproni",
    store: new RedisStore({ client: redisClient }),
    saveUninitialized: true,
    resave: true,
    cookie: {
        httpOnly: false,
        secure: false,
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

app.use("/users", usersRouter)
resetTasks()
scheduleDailyResets()

// app.use('/users', passport.authenticate('jwt', {session: false}), usersRouter);

app.use(
    "/api/graphql",
    graphqlHTTP(async (req: any, res, graphQLParams) => {
        // console.log("gql user = ", req.user)
        return {
            schema: schema,
            graphiql: true,
            context: {
                user: req.user
            },
            customFormatErrorFn: (error: GraphQLError) => {
                const errId = uuidv4();
                logger.error(`errId: ${errId}`);
                logger.error(error);

                return new GraphQLError(`Internal Error: ${errId}`);
            }
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
