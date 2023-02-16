const express = require('express');
const cors = require('cors');

const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ajito.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



const run = async() => {
    try{
        const appointmentOptionCollections = client.db('doctorsDen').collection('appointmentOption');

        app.get('/appointmentOptions', async(req, res) =>{
            const query = {};
            const result = await appointmentOptionCollections.find(query).toArray();
            res.send(result);
        })
    }
    finally{

    }
}

run().catch(err => console.log(err))


app.get('/', async(req, res) =>{
    res.send('the doctors den is running')
})

app.listen(port, () => {
    console.log(`server running on ${port}`);
})