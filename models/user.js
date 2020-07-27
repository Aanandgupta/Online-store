const getDb = require("../util/database").getDb;
const mongodb = require("mongodb");
// const User = require('../models')
const bcrypt = require("bcryptjs");
module.exports = class User {
  constructor(username, email, id, cart, orders) 
  {
    this.name = username;
    this.email = email;

    this.id = new mongodb.ObjectID(id);
    this.cart = cart;
    this.orders = orders;
  }
  
  save(pass)
  {
    const db = getDb();
    bcrypt.hash(pass,12).then(
      hashedPass =>{
      const userData = {
        name: this.name,
        email: this.email,
        password: hashedPass,
        cart: this.cart,
        orders: this.orders
      }
      return db.collection("users").insertOne(userData);
    }
    )
    
  }
  static fetchByEmail(email)
  {
    const db = getDb();
    return db.collection("users").findOne({email: email})
  }


  static updateOrders(userId, orders)
{
    const db = getDb();
    return db.collection("users").updateOne({_id: new mongodb.ObjectID(userId)}, {$set: {orders: orders}});
}
  
  static deleteFromCart(userId, productId, completeDel = false)
  {
    const db = getDb();
    return db.collection("users").findOne({_id: new mongodb.ObjectID(userId)}).then(
      user=>{
        const tempCart = [...user.cart];

        let ind = -1;
        
        let count = 0;
        for(let i of tempCart){
          if(i.product.toString()==productId.toString()){
            ind=count;
            break;
          }
          count++;
        }

        if(ind>=0){
          tempCart[ind].qty-=1;
          if(tempCart[ind].qty==0 || completeDel)
          {
            tempCart.splice(ind,1);
          }
        }
        // console.log("From Delete",tempCart);
        return db.collection("users").updateOne({_id: new mongodb.ObjectID(userId)}, {$set: {cart: tempCart}})
      }
    )
  }
  static fetchFromCart(userId){
    const db = getDb();
    return db.collection("users").findOne({_id: new mongodb.ObjectID(userId)}, {_id:0, cart: 1})
  }
  static addToCart(product, userId) {
    const db = getDb();

    db.collection("users")
      .findOne({ _id: new mongodb.ObjectID(userId)})
      .then((userData) => {
        let userCart = userData.cart;
        // console.log(userCart)
        // console.log("From My Side",userCart[0].product, product._id);
        // console.log(userCart.length);
        // console.log(userCart[0].product.toString()==product._id.toString());
        for (let i = 0; i < userCart.length; i++) {
          if ((userCart[i].product).toString() == (product._id).toString()) 
          {
            // userCart[i].product = new mongodb.ObjectID(userCart.product);
            userCart[i].qty += 1;
            
            return db
              .collection("users")
              .updateOne({ _id:new mongodb.ObjectID(userId) }, {$set:{cart:[...userCart]}});
          }
        }
        return db
          .collection("users")
          .updateOne( 
            { _id: new mongodb.ObjectID(userId) },
            {
              $set: {
                cart: [
                  ...userCart,
                  { product: new mongodb.ObjectID(product._id), qty: 1 },
                ],
              },
            }
          );
      });
  }
  static fetchById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectID(userId) });
  }
};

