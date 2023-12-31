const express = require('express')
const { MongoClient, ObjectID } = require('mongodb');
const app = express()

// Enable CORS middleware
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  
  

const port = 3000;

// Replace the placeholder with your Atlas connection string
const uri = 'mongodb+srv://admin:admin@testingcluster.tsc0i26.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connect to the MongoDB database
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToMongoDB();


// Specify the collection name you want to work with
const Database = 'e_commerce'
const collection = () => client.db(Database).collection('users');
const products = () => client.db(Database).collection('products')
const cart = () => client.db(Database).collection('item_cart')

// Middleware to parse JSON data in the request body
app.use(express.json());




// CRUD operations

// Base route
app.get('/', async (req, res) => {
    try {
      const documents = await collection().find({}).toArray();
      res.json(documents);
    } catch (error) {
      console.error('Error retrieving documents:', error);
      res.status(500).send('Error retrieving documents' + error);
    }
  });
  
  // Get all users
  app.get('/user', async (req, res) => {
    try {
      const documents = await collection().find({}).toArray();
      res.json(documents);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Create a new user
  app.post('/user', async (req, res) => {
    try {
      const newDocument = req.body;
      const result = await collection().insertOne(newDocument);
      console.log(result)
  
      //get all data
      const users = await collection().find({}).toArray()
      res.json({requestStatus:'success',users});
    } catch (error) {
      console.error('Error creating document:', error);
      res.status(500).json({requestStatus:'error'});
    }
  });
  
  // Get a user by ID
  app.get('/user/:id', async (req, res) => {
    try {
      const documentId = req.params.id;
      const document = await collection().findOne({ _id: ObjectID(documentId) });
      res.json(document);
    } catch (error) {
      console.error('Error retrieving document:', error);
      res.status(500).send('Error retrieving document: '+error);
    }
  });
  
  
  //auth
  
  app.post('/authenticate', async (req, res) => {
    try {
      const { email, password } = req.body;
      const document = await collection().findOne({ email, password });
  
      if (document) {
        res.json({ auth: true , content: document});
      } else {
        res.json({ auth: false });
      }
    } catch (error) {
      console.error('Error authenticating user:', error);
      res.status(500).send('Error authenticating user');
    }
  });
  
  //products
  app.get('/products', async (req, res) => {
    try {
      const documents = await products().find({}).toArray();
      res.json(documents);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  //add product to cart per id

  app.post('/add-to-cart', async (req, res) => {
    try {
      const { _idUser, _idProduct } = req.body;
      const GetProduct = await products().findOne({ _id: ObjectID(_idProduct) });

      
      const newProduct = {'name':GetProduct.name, 'image_url': GetProduct.image_url, 'price': GetProduct.price, 'user_id': _idUser }

      const result = await cart().insertOne(newProduct);

      if (result) {
        res.json({ added: true , content: document});
      } else {
        res.json({ added: false });
      }
    } catch (error) {
      console.error('Error authenticating user:', error);
      res.status(500).send('Error authenticating user');
    }
  });