// const mysql = require('mysql2')
// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: 'shrey1510'
// });

// module.exports = pool.promise();

const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;


let _db;
const mongoConnect = (callback)=>{
    MongoClient.connect('mongodb+srv://vedant:TNXSTm0YIvjncr2b@cluster0.r6wfl.mongodb.net/test?retryWrites=true&w=majority',{useNewUrlParser: true }).then(
        result=>{
            console.log('Connected')
            _db = result.db()
            callback();
        }
    ).catch(
        err=>console.log(err)
    );
};

const getDb = () =>{
    if(_db){
        return _db;
    }

    throw 'No Database Found'
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;