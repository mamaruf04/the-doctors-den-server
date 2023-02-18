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

        const BookingsCollection = client.db('doctorsDen').collection('bookings');


        app.get( "/appointmentOptions", async (req,res) => {
            const date = req.query.date;
            const query = {};
            const options = await appointmentOptionCollections.find(query).toArray();
            const bookingQuery = {appointmentDate: date};
            const alreadyBooked = await BookingsCollection.find(bookingQuery).toArray();
            options.forEach(option =>{
                const optionsBooked = alreadyBooked.filter(book => book.treatment === option.name);
                const bookedSlot = optionsBooked.map(book => book.slot);
                const remainingSlot = option.slots.filter(slot => !bookedSlot.includes(slot) )
                option.slots = remainingSlot;
            })
            res.send(options);
        } )

        app.post('/bookings' , async(req,res) => {
            const bookings = req.body;
            const query = {
                email: bookings.email,
                appointmentDate : bookings.appointmentDate,
                treatment: bookings.treatment
            }
            const alreadyBooked =  await BookingsCollection.find(query).toArray();

            if (alreadyBooked.length) {
                const message = `you already have a booking on ${bookings.appointmentDate}`
                return res.send({acknowledged: false, message})
            }

            const result = await BookingsCollection.insertOne(bookings);
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