const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require ('cors');
const port = process.env.PORT || 6001;
require('dotenv').config();

// middlewares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@hungrybox-db.oxcpesj.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


  // Establish connection for database and collections
    const menuCollections = client.db("hungrybox-db").collection("menu");
    const cartCollections = client.db("hungrybox-db").collection("cartItems");

    // all menu items operations
    app.get('/menu', async (req, res) => {
      const result = await menuCollections.find({}).toArray();
      res.send(result);
    });


    // all cart items operations

    // 1. posting cart on db
    app.post('/carts', async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollections.insertOne(cartItem);
      res.send(result);
    });



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close(); // database stop purpose 
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.listen(port, () => {
    console.log(`Example app listening at port number:${port}`);
});