const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}))
app.use(express.json())



const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PD}@cluster0.l4anbhy.mongodb.net/?retryWrites=true&w=majority`;

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
    // Send a ping to confirm a successful connection
    const Hotalcollection = client.db('HotalDB').collection('Booked')
    app.get('/api/v1/booking',async(req,res)=>{
      const result = await Hotalcollection.find().toArray()
      res.send(result)
    })
    app.get('/api/v1/booking/:id',async(req,res)=>{
      console.log(req.params.id)
      const id = req.params.id
      const qurey = {_id : new ObjectId(id)}
      const result = await Hotalcollection.findOne(qurey)
      res.send(result)
    })
// jwt token api
app.post('/jwt',async(req,res)=>{
  const email = req.body
  const token =jwt.sign(email, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
  res
  .cookie('token',token,{
    httpOnly:true,
    secure:true,
    sameSite:'none'
  })
  .send({success:true})
})
app.post('/logout',async(req,res)=>{
  const user = req.body;
  res.clearCookie('token',{maxAge:0}).send({success:true})
})
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Hotal book!')
})

app.listen(port, () => {
  console.log(`assignment-11 listening on port ${port}`)
})