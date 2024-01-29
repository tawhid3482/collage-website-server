const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    await client.connect();

    const departmentCollection = client
      .db("collageDb")
      .collection("department");

    // al collection here
    const userCollection = client.db("collageDb").collection("users");
    const eventsCollection = client.db("collageDb").collection("events");
    const applicationCollection = client
      .db("collageDb")
      .collection("application");
    const newsCollection = client.db("collageDb").collection("news");
    const serviceCollection = client.db("collageDb").collection("services");
    const uniCollection = client.db("collageDb").collection("uniEvents");
    const cartCollection = client.db("collageDb").collection("carts");

    //users
    // i am sorry hm
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser)
        return res.send({ message: "user already exists", insertedId: null });
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // department
    app.get("/department", async (req, res) => {
      const result = await departmentCollection.find().toArray();
      res.send(result);
    });

    // event
    app.get("/events", async (req, res) => {
      const result = await eventsCollection.find().toArray();
      res.send(result);
    });
    //application
    app.get("/application", async (req, res) => {
      const result = await applicationCollection.find().toArray();
      res.send(result);
    });
    // news
    app.get("/news", async (req, res) => {
      const result = await newsCollection.find().toArray();
      res.send(result);
    });
    //services
    app.get("/services", async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });
    // uniEvents
    app.get("/uniEvents", async (req, res) => {
      const result = await uniCollection.find().toArray();
      res.send(result);
    });
    // carts
    app.post("/carts", async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    });
    app.get("/carts", async (req, res) => {
      const result = await cartCollection.find().toArray();
      res.send(result);
    });
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // delete the text
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("collage is running");
});
app.listen(port, () => {
  console.log(`collage is running ${port}`);
});
