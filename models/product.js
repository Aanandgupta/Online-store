const mongodb = require('mongodb')
const getDb = require('../util/database').getDb;


module.exports = class Product{
    constructor(title, price, url, description, userId){
        this.title=title;
        this.price=price;
        this.url=url;
        this.description=description;
        this.userId = new mongodb.ObjectID(userId)
    }

    save(){
        // return db.execute("INSERT INTO products (title, price, url, description) VALUES(?, ?, ?, ?)",
        // [this.title, this.price, this.url, this.description])
        const db = getDb();
        return db.collection('products').insertOne(this)

    }

    static fetchAll(skip=null, limit=null){
        const db = getDb();
        if(limit==null)
        return db.collection('products').find().toArray()

        if(skip==null)
        skip = 0

       return db.collection('products').find().skip(skip).limit(limit).toArray()
        
    }

    static countProducts(){
        const db = getDb();
        return db.collection('products').countDocuments();
    }
    static fetchById(id){
        const db = getDb();
        return db.collection('products').findOne({_id:  new mongodb.ObjectID(id)});
    }

    static changeById(id, title, price, url, description){
        const db = getDb();
        return db.collection('products').updateOne({_id:  new mongodb.ObjectID(id)}, {$set: {title: title, price: price, url: url, description: description}});
    }

    static deleteById(id){
        const db = getDb();
        return db.collection('products').deleteOne({_id: new mongodb.ObjectID(id)});
    }
}
