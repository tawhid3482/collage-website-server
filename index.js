const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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

    // all collection here
    const userCollection = client.db("collageDb").collection("users");
    const eventsCollection = client.db("collageDb").collection("events");
    const applicationCollection = client
      .db("collageDb")
      .collection("application");
    const newsCollection = client.db("collageDb").collection("news");
    const serviceCollection = client.db("collageDb").collection("services");
    const uniCollection = client.db("collageDb").collection("uniEvents");
    const cartCollection = client.db("collageDb").collection("carts");

    // jwt
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // middleWare for jwt
    const verifyToken = (req, res, next) => {
      // console.log(req.headers);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "unauthorized access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "unauthorized access" });
        }
        req.decoded = decoded;
        next();
      });
    };
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(401).send({ message: "forbidden access" });
      }
      next();
    };

    //Payment-stripe-api
    app.post("/create-payment-intent", async (req, res) => {
      const { fee } = req.body;
      const amount = parseInt(fee * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });
    //users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser)
        return res.send({ message: "user already exists", insertedId: null });
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
      const result = await userCollection.find().toArray();
      console.log(req.headers);
      res.send(result);
    });

    app.get("/users/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });

    app.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.patch(
      "/users/admin/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            role: "admin",
          },
        };
        const result = await userCollection.updateOne(query, updatedDoc);
        res.send(result);
      }
    );

    // department
    app.get("/department", async (req, res) => {
      const result = await departmentCollection.find().toArray();
      res.send(result);
    });
    app.get("/department/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await departmentCollection.findOne(query);
      res.send(result);
    });
    app.post("/department", verifyToken, verifyAdmin, async (req, res) => {
      const course = req.body;
      const result = await departmentCollection.insertOne(course);
      res.send(result);
    });
    app.patch("/department/:id", verifyToken, verifyAdmin, async (req, res) => {
      const course = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          name: course.name,
          campus: course.campus,
          courseId: course.courseId,
          credit: course.credit,
          dateRange: course.dateRange,
          department: course.department,
          description1: course.description1,
          description2: course.description2,
          description3: course.description3,
          fee: course.fee,
          image: course.image,
          insImage: course.insImage,
          instructor: course.instructor,
          level: course.level,
          method: course.method,
          scholarship: course.scholarship,
          time: course.time,
          semester: course.semester,
        },
      };
      const result = await departmentCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    app.delete(
      "/department/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await departmentCollection.deleteOne(query);
        res.send(result);
      }
    );

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
