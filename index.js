const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s64u1mi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const departmentCollection = client
      .db("collageDb")
      .collection("department");

   const eventsCollection = client.db('collageDb').collection('events')
   const applicationCollection = client.db('collageDb').collection('application')
   const newsCollection = client.db('collageDb').collection('news')
   const serviceCollection = client.db('collageDb').collection('services')
   const uniCollection = client.db('collageDb').collection('uniEvents')
   const cartCollection = client.db('collageDb').collection('carts')

    app.get("/department", async (req, res) => {
      const result = await departmentCollection.find().toArray();
      res.send(result);
    });

    app.get("/events",async(req,res)=>{
      const result = await eventsCollection.find().toArray()
      res.send(result)
    })
    app.get("/application",async(req,res)=>{
      const result = await applicationCollection.find().toArray()
      res.send(result)
    })
    app.get("/news",async(req,res)=>{
      const result = await newsCollection.find().toArray()
      res.send(result)
    })
    app.get("/services",async(req,res)=>{
      const result = await serviceCollection.find().toArray()
      res.send(result)
    })
    app.get("/uniEvents",async(req,res)=>{
      const result = await uniCollection.find().toArray()
      res.send(result)
    })
    
    app.post('/carts',async(req,res)=>{
      const cartItem = req.body
      const result = await cartCollection.insertOne(cartItem)
      res.send(result)
    })
    app.get('/carts',async(req,res)=>{
      const result = await cartCollection.find().toArray()
      res.send(result)
    })


    // Send a ping to confirm a successful connectio
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("collage is running");
});
app.listen(port, () => {
  console.log(`collage is running ${port}`);
});
