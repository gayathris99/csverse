const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const pool = require('./config/db')
const authRoutes = require('./routes/auth')
const csvRoutes = require('./routes/csv')
const verifyToken = require('./middleware/auth')

const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/csv', verifyToken, csvRoutes)


app.get('/health', (req, res) => {
    res.json({ status: 'OK'})
})

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.log('DB connection failed:', err)
    } else {
        console.log('DB connected at:', res.rows[0].now)
    }     
})

app.listen(process.env.PORT || 8000, () => {
    console.log('Server is running')
})