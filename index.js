const express = require('express')
const cors = require('cors')
const app = express()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000
require("dotenv").config();

// middleware 
app.use(cors())
app.use(express.json())


const verifyJwt = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: "unauthorized token" });
    }
    const token = authorization.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_JWT, (err, decoded) => {
        if (err) {
            return res
                .status(401)
                .send({ error: true, message: "unauthorized token" });
        }
        req.decoded = decoded;
        next();
    });
};

// server connect 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_N}:${process.env.USER_PAS}@cluster0.bfheqge.mongodb.net/?retryWrites=true&w=majority`;
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
        // sata store connection 

        const DemoData = client.db('DemoData').collection('DemoClass')
        const UserData = client.db('UserData').collection('UserCollection')



        // jwt related 
        console.log(process.env.ACCESS_TOKEN_JWT);
        app.post('/jwt', (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_JWT, {
                expiresIn: '1h'
            })
            res.send({ token })
        })



        // post here all 
        app.post('/newUser', async (req, res) => {
            const body = req.body;
            const email = req.query.email;
            // const query = email;
            const existingUser = await UserData.findOne({ email: email })
            if (existingUser) {
                res.status(909).json({ message: 'User already exists' });
            }
            const users = await UserData.insertOne(body)
            res.send(users)
        })


        // here is all put method 
        app.put('/class', async (req, res) => {
            const body = req.body;
            const addClass = await DemoData.insertOne(body)
            res.send(addClass)

        })

        app.patch('/newUser/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    role: "admin",
                },
            };
            const result = await UserData.updateOne(filter, updatedDoc);
            res.send(result);
        })

        // admin get 
        //  data get 
        app.get("/newUser/:email", async (req, res) => {
            const email = req.params.email;
    
            const query = { email: email };
            const user = await UserData.findOne(query)
            const result = { admin: user?.role === "admin" };
            res.send(result);
        });

        // class data get 
        app.get('/class', async (req, res) => {
            const body = req.body;
            const result = await DemoData.find(body).toArray();
            res.send(result)
        })
        app.get('/class/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await DemoData.find(query).toArray();
            res.send(result)
        })


        app.get('/users', async (req, res) => {
            const body = req.body;
            const allUsers = await UserData.find(body).toArray();
            res.send(allUsers)
        })





        // delete class id 
        app.delete('/class/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const deleteDone = await DemoData.deleteOne(query)
            res.send(deleteDone)

        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const deleteOne = UserData.deleteOne(query);
            res.send(deleteOne)
        })








        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})