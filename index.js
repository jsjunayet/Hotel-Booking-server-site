const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieparser = require("cookie-parser")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
app.use(cookieparser())
app.use(cors({
  origin:['https://adorable-horse-3c6729.netlify.app',],
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
const verify =(req,res,next)=>{
  const token = req.cookies?.token
  // console.log("ttotot",token)
  if(!token)
  {
    return res.status(401).send({message:'unauthorized access'})
  }
  jwt.verify(token,process.env.ACCESS_TOKEN,(err,decoded)=>{
    if(err){
      return res.status(401).send({message:'unauthorized access'})
    }
    req.user = decoded;
    next()
  })
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    const Hotalcollection = client.db('HotalDB').collection('Booked')
    const myBookingCollection = client.db('HotalDB').collection('mybooked')
    const reviewCollection = client.db('HotalDB').collection('Review')
    app.get('/api/v1/booking',async(req,res)=>{
      const result = await Hotalcollection.find().toArray()
      res.send(result)
    })
    app.get('/api/v1/booking/:id',async(req,res)=>{
      
      const id = req.params.id
      const qurey = {_id : new ObjectId(id)}
      const result = await Hotalcollection.findOne(qurey)
      res.send(result)
    })
    app.get('/api/v1/review',async(req,res)=>{
      const result =await reviewCollection.find().toArray()
      res.send(result)
    })
    app.get('/booknow/:id',async(req,res)=>{
      const id = req.params.id
      const qurey = {_id : new ObjectId(id)}
      const result = await Hotalcollection.findOne(qurey)
      res.send(result)
    })
    app.post('/api/v1/mybook',verify,async(req,res)=>{
      if(req.body.email!== req.user.email)
      {
        return res.status(403).send({message:'forbidden access'})
      }
      const curse = req.body
      const result = await myBookingCollection.insertOne(curse)
      res.send(result)
    })
    app.get('/api/v1/mybook',verify,async(req,res)=>{
      console.log(req.query.email)
      console.log('decoder',req.user.email)
      if(req.query?.email!==req.user.email)
      {
        return res.status(403).send({message:'forbidden access'})
      }
      let query = {};
      if(req.query?.email)
      {
        query = {email: req.query.email}
      }
      const result = await myBookingCollection.find(query).toArray()
      res.send(result)
    })
    app.get('/api/v1/reviews',async(req,res)=>{
      console.log(req.query?.roomid)
      let query = {};
      if(req.query?.roomid)
      {
        query = {roomid: req.query?.roomid}
      }
      
      const result = await reviewCollection.find(query).toArray()
      res.send(result)
    })
    app.delete('/api/v1/mybook/:id',async(req,res)=>{
      const id = req.params.id;
      const qurey = {_id:new ObjectId(id)}
      const result = await myBookingCollection.deleteOne(qurey)
      res.send(result)
    })
    app.patch('/api/v1/mybook/update/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id:new ObjectId(id)}
      const update = req.body
      const updatedoc ={
        $set:{
          startDate: update.date
        }
      }
      const result = await myBookingCollection.updateOne(query,updatedoc)
      res.send(result)
      

    })
    app.post('/review',async(req,res)=>{
      const curse = req.body
      const result = await reviewCollection.insertOne(curse)
      res.send(result)
    })
// jwt token api
app.post('/jwt',async(req,res)=>{
  const email = req.body
  const token =jwt.sign(email, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
  // res
  // .cookie('token',token,{
  //   httpOnly:true,
  //   secure:true,
  //   sameSite:'none'
  // })
  // .send({success:true})
  res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
})
app.post('/logout',async(req,res)=>{
  const user = req.body;
  // res.clearCookie('token',{maxAge:0}).send({success:true})
  res.clearCookie('token', {
            maxAge: 0,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          })
          .send({ success: true })
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