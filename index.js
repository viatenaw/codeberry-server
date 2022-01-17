require('dotenv').config();
const express = require('express');
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectID

const cors = require('cors');
const app = express();
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.miri0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
app.use(cors());
app.use( bodyParser.json());
console.log('got a request', process.env.MONGO_USER, process.env.MONGO_PASS)

app.use(bodyParser.urlencoded({ extended: true }))
app.get('/cards', async (req, res) => {
    console.log('got a request')
    MongoClient.connect(uri, async (err, client) => {
        if (err) console.log(err)
        try {
            const db = client.db('codeberry')
            const resp = await db.collection('users').find().toArray()
            console.log('resp is', resp)
            client.close()
            res.send({
                users: resp
            })
        } catch (error) {
            client.close()
            res.status(500).send({ error })
        }
    })
    
})

app.post('/update-cards', (req, res) => {
    const body = typeof req.body === 'string' ? (JSON.parse(req.body) ?? {}) : req.body
    console.log('Hellooooooooooooooooo!', body)
    if (!body?._id) return res.status(400).send({ error: 'bad data' })
    const userId = ObjectId(body._id)
    delete body._id
    console.log('userId', userId)
    MongoClient.connect(uri, async (err, client) => {
        if (err) console.log(err)
        try {
            const db = client.db('codeberry')
            const resp = await db.collection('users').findOneAndUpdate(
                {_id: userId},
                { $set: {...body} }
            )
            console.log('resp is', resp)
            client.close()
            res.send({
                success: true
            })
        } catch (error) {
            client.close()
            res.status(500).send({ error, success: false })
        }
    })
})
const PORT = 8000
app.listen(PORT, function() {
    console.log('listening on', PORT)
})