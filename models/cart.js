const { createBrotliCompress } = require('zlib');
const getDb = require('../util/database').getDb;

const mongodb = require('mongodb');
module.exports = class Cart {
    
    constructor(id, productPrice){
        this.id = id;
        this.productPrice = productPrice;
        const db = getDb();

        return db.collections('cart').findOne({_id: new mongodb.ObjectID(id)});
    }

    static save(exist, id, productPrice){
        const db = getDb();
        if(exist){
            return db.collections('cart').updateOne({_id: new mongodb.ObjectID(id)}, {$set: {qty: newQty}})
            // return db.execute("UPDATE cart SET qty = qty+1 WHERE id = ?", [id])
        }
        else{
            return db.execute("INSERT INTO cart (id, qty, price) VALUES (?, 1, ?)", [id, productPrice])
        }
    }
    static fetchAll(){
        return db.execute('SELECT cart.id, products.title, cart.qty, cart.price FROM cart INNER JOIN products ON products.id=cart.id')
    }
    static DeleteById(id){
        return db.execute("UPDATE cart SET qty = qty-1 WHERE id = ?", [id]).then(
            result=>{
                return db.execute("SELECT * FROM cart WHERE id = ?", [id])
            }
        ).then(([result])=>{
            if(result[0].qty==0){
                return db.execute("DELETE FROM cart WHERE id = ?", [id])
            }
        })
    }
}