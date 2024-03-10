const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const userCollections = client.db("hungrybox-db").collection("users");

    // all menu items operations
    app.get('/menu', async (req, res) => {
      const result = await menuCollections.find({}).toArray();
      res.send(result);
    });

    // all user operations
    // 1. get all users
    app.get('/users', async (req, res) => {
      try {
        const users = await userCollections.find({}).toArray();
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users: ' + error.message });
      }
    });

    // 2. post a user 
    app.post('/users', async (req, res) => {
      try {
        const newUser = req.body;
        // insert email if user doesnt exist
        const query = { email : newUser.email };
        const existingUser = await userCollections.findOne(query);
        if (existingUser) {
          res.status(409).json({ message: 'User already exists', insertedId: existingUser._id});
          return;
        }
        const result = await userCollections.insertOne(newUser);
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({ message: 'Failed to create user: ' + error.message });
      }
    });
    
    // 3. users collection by id
        app.get('/users/:id', async (req, res) => {
          const id = req.params.id;
          const email = req.query.email;
          const query = {
              _id: new ObjectId(id),
              useremail: email
          };
          const user = await userCollection.findOne(query);
          res.json(user);
      });
    



    // all cart items operations

    // 1. posting cart on db
    app.post('/carts', async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollections.insertOne(cartItem);
      res.send(result);
    });

    // 2. Get carts using email
    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      const filter = {email: email};
      const result = await cartCollections.find(filter).toArray();
      res.send(result); // for check carts in localhost = http://localhost:6001/carts?email=yourmail
    });

    // 3. Get specific cart item using id
    app.get('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const result = await cartCollections.findOne(filter);
      res.send(result);
    });
  
    // 4. Delete cart item
    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const result = await cartCollections.deleteOne(filter);
      res.send(result);
    });

    // 5. Update cart quantity
    app.put('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const {quantity} = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updateDoc = {
        $set: {
          quantity: parseInt(quantity,10),
        },
      };
      const result = await cartCollections.updateOne(filter, updateDoc, options);
      // res.send(result);
    });




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close(); // database stop purpose 
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello Hungrybox Server');
});


app.listen(port, () => {
    console.log(`hungrybox server listening at port number:${port}`);
});