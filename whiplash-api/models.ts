import './db';
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose, { Document, Schema, Model, model} from "mongoose";


export interface ITask {
    userID: string
    title: string
    description: string
    priority: number
    state: string
    isRecurring: boolean

    dueTime: number
    segmentDuration: number
    duration: number
    progress: number
    resetMode: string
    resetTime: number
    color: string
    completedAt: Date
    createdAt: Date
    updatedAt: Date
}

export interface ITaskModel extends ITask, mongoose.Document { }

const TaskSchema = new mongoose.Schema(
    {
        userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true, },

        title: { type: String, trim: true, required: true },
        description: { type: String, default: "" },

        priority: { type: Number, default: 1 },
        state: { type: String, default: "active", enum: ['active', 'completed', 'archived'] },
        isRecurring: { type: Boolean, default: false }, // merge into resetMode?

        // resetTasksAt - custom daily reset time / or day start time
        dueTime: { type: Number, default: 0 },
        segmentDuration: { type: Number, default: 0 },
        duration: { type: Number, default: 3600 },
        progress: { type: Number, default: 0 },
        resetMode: { type: String, enum: ['atDays', 'inDays'], default: "inDays"},
        resetTime: { type: Number, default: 1 },
        // startTime: { type: Number, default: 0 },
        
        color: { type: String, default: () => "" },
        completedAt: { type: Date }
    },
    {
        collection: "task",
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
    }
);


/*  start_time 
 *      - if present, shold be projected on the timeline
 *      - should be prioritized in the task list close to that time
 *  task_time => progress / time_spent
 *  task_length => length
 *      - should be autocompleted if reached the max len
 *  state: ['active', 'completed', 'inprogress??', 'archived']
 *  is_recurring: { type: Boolean, default: false },
 *  is_unfinished - set on client side if time spent > 0, but not completed
 *  is_new - set on client side if created_at is less than 1-2 days
 *  priority: { type: Number, default: 1 },
 *      - 4 red: urgent & important
 *      - 3 orange: important
 *      - 2 yellow: urgent & not important
 *      - 1 green: macro / non-urgent semi-important?
 *      - 0 grey?
 *  color
 *      - should be randomly generated at a certain brightness
 * 
 * 
 */

// TaskSchema.methods.reset = () => {};

export const Task = mongoose.model<ITaskModel>("Task", TaskSchema);

const TodoSchema = new mongoose.Schema(
    {
        title: { type: String, trim: true, required: true, maxlength: 100 },
        description: { type: String, default: "" },
        priority: { type: Number, default: 50 },
        state: { type: String, default: "ACTIVE" },
        color: { type: String, default: "" },

        // created_date: { type: Date, default: () => Date.now() },
        is_time_limited: { type: Boolean, default: false },
        expiration_date: { type: Date, default: () => Date.now() }
    },
    {
        collection: "todo",
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
    }
);

export const Todo = mongoose.model("Todo", TodoSchema);

export interface IUser extends Document {
    username: string
    name: string
    email: string
    hash: string
    refreshTokenKey: string
    createdAt: string
    updatedAt: string
    setPassword: (password: string) => Promise<string>
    validatePassword: (password: string) => boolean
    toAuthJSON: () => object
    // ...
}

export interface IUserModel extends Model<IUser> {
    checkUnique: (user: ITaskModel) => Promise<boolean>
}

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, trim: true, required: true, maxlength: 20 },
        name: { type: String, maxlength: 100 },
        email: { type: String, required: true, maxlength: 100 },
        // roles: [{ type: String, enum: ['user', 'admin'] }],
        hash: String,
        // salt: String,
        refreshTokenKey: String
    },
    {
        collection: "user",
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
    }
);

UserSchema.methods.setPassword = function(password) {
    // this.salt = crypto.randomBytes(16).toString("hex");
    // this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");

    return new Promise((resolve, reject) => {
        const hashCost = 10
        bcrypt.hash(password, hashCost, (err, hash) => {
            if (err) return reject(err)
            this.hash = hash
            resolve(hash)
        })
    })
};


UserSchema.methods.validatePassword = function(password) {
    // const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
    // return this.hash === hash;

    return bcrypt.compare(password, this.hash);
};

UserSchema.statics.checkUnique = function(user) {
    return new Promise(async (resolve, reject) => {
        let result = await this.findOne({ username: user.username })
        if (result) reject("User already exists")

        result = await this.findOne({ email: user.email })
        if (result) reject("E-mail already registered")

        resolve(true);
    });
};


// const RSA_PRIVATE_KEY = fs.readFileSync('./demos/private.key');
export const RSA_PRIVATE_KEY = "secretKey"

UserSchema.methods.genAccessToken = function(expiresIn = 120) {
    expiresIn = 120*300 // TODO: Remove
    return jwt.sign(
        {
            email: this.email,
            id: this._id,
            // exp: parseInt(expirationDate.getTime() / 1000, 10)
        },
        RSA_PRIVATE_KEY,
        {
            // algorithm: 'RS256',
            expiresIn,
        }
    );
};

UserSchema.methods.genRefreshToken = function() {
    const newKey = crypto.randomBytes(16).toString("hex");
    this.refreshTokenKey = newKey
    this.save()
    const payload = {
        email: this.email,
        id: this._id,
    }
    return jwt.sign(payload, newKey, { algorithm: 'HS256' });
};

UserSchema.methods.toAuthJSON = function() {
    const expiresIn = 60*60*2 // 2 hours
    return {
        _id: this._id,
        username: this.username,
        accessToken: this.genAccessToken(expiresIn),
        refreshToken: this.genRefreshToken(),
        expiresIn
    };
};

UserSchema.methods.toUserDataJSON = function() {
    return {
        _id: this._id,
        username: this.username,
    };
};

export const User = mongoose.model<IUser, IUserModel>("User", UserSchema);