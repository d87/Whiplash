import mongoose from 'mongoose'

const makeDB = async () => {
    try{
        await mongoose.connect('mongodb://localhost:27017/whiplash', { useNewUrlParser: true })
    }
    catch(err){
        console.error(err)
    }
    return mongoose.connection
}

const dba = mongoose.connection;
dba.on('error', console.error.bind(console, 'Connection error:'));
dba.once('open', () => {
    console.log("Connected to database")
});

makeDB()