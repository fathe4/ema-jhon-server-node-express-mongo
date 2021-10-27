const express = require('express')
const cors = require('cors')
const { MongoClient } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mnat7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect();
        const database = client.db("ema_jhon");
        const productsCollection = database.collection("products");
        const ordersCollection = database.collection("orders");

        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({})
            const count = await cursor.count()
            const page = req.query.page
            const size = parseFloat(req.query.size)
            let products;

            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            } else {
                products = await cursor.toArray()
            }


            res.send({ count, products })
        })

        // DIsplay cart products
        app.post('/products/byKeys', async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } }
            const products = await productsCollection.find(query).toArray()
            res.json(products)
        })

        app.post('/orders', async (req, res) => {
            const order = req.body
            const result = await ordersCollection.insertOne(order)
            res.json(result)
        })

    } finally {
        //    await client.close()
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running from node express')
})



app.listen(port, () => {
    console.log('Listening from port: ', port);
})