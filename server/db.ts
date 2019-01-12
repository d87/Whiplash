import mongoose from 'mongoose'
import { logger } from './logger'

const makeDB = async () => {
    try{
        await mongoose.connect('mongodb://localhost:27017/whiplash', { useNewUrlParser: true })
    }
    catch(err){
        logger.error(err)
    }
    return mongoose.connection
}

const dba = mongoose.connection;
dba.on('error', console.error.bind(console, 'Connection error:'));
dba.once('open', () => {
    logger.info("Connected to database")
});

makeDB()