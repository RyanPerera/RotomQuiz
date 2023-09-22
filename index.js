require('dotenv').config();
var pg = require('pg');

var conString = process.env.CONSTRING;

const express = require('express')
const app = express()
const cors = require('cors')

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

//GET ALL QUESTIONS
app.get('/api/questions', async (req, res) => {
    try {
        //create new client to connect to db
        var client = new pg.Client(conString);
        await client.connect()
        console.log('Client connected')
        //retrieve all questions
        const { rows } = await client.query('SELECT * FROM quiz_question')
        //return response
        res.send(rows)
        //end connection
        await client.end()
    }
    catch (ex) {
        console.log("Some error" + ex)
    }
    finally {
        await client.end()
    }
})

//GET ALL ANSWERS
app.get('/api/answers', async (req, res) => {
    try {
        var client = new pg.Client(conString);
        await client.connect()
        console.log('Client connected')

        const { rows } = await client.query('SELECT * FROM quiz_answer')

        res.send(rows)
        await client.end()
    }
    catch (ex) {
        console.log("Some error" + ex)
    }
    finally {
        await client.end()
    }
})

//GET SPECIFIC QUESTION FROM ID
app.get('/api/questions/:qid', async (req, res) => {
    const qid = Number(req.params.qid)
    console.log("Retrieving question number ", qid)
    try {
        var client = new pg.Client(conString);
        await client.connect()
        console.log('Client connected')

        const { rows } = await client.query(`SELECT * FROM quiz_question WHERE "questionId"=${qid}`)

        res.send(rows)
        await client.end()
    }
    catch (ex) {
        console.log("Some error" + ex)
    }
    finally {
        await client.end()
    }
})

//GET QUESTION OF THE DAY
app.get('/api/qotd', async (req, res) => {
    // get date
    const date = new Date();
    let currYear = date.getFullYear();
    let currMonth = String(date.getMonth() + 1).padStart(2, "0");
    let currDay = String(date.getDate()).padStart(2, '0');

    // YYYY-MM-DD for postgresql
    let currDate = `${currYear}-${currMonth}-${currDay}`;
    console.log("Welcome to the RotomQuiz website. The current date is " + currDate);

    var rows = {}

    try {
        var client = new pg.Client(conString);
        await client.connect()
        console.log('Client connected')

        var q = await client.query(`SELECT "questionId", content FROM quiz_question WHERE "questionId" = (SELECT qid from qotd WHERE "date"='${currDate}')`)
        var a = await client.query(`SELECT id, content FROM quiz_answer WHERE qid = (SELECT qid from qotd WHERE "date"='${currDate}')`)
        rows[0] = q.rows
        rows[1] = a.rows

        res.send(rows)
        await client.end()
    }
    catch (ex) {
        console.log("Some error" + ex)
    }
    finally {
        await client.end()
    }
})

//FILTER FROM QUESTION LIST
app.get('/api/filter', async (req, res) => {
    const difficulty = req.query.difficulty
    const category = req.query.category
    const generation = req.query.generation
    console.log("Retrieving questions of difficulty ", difficulty, " in category ", category, " about generation ", generation)

    //build query
    var squery = 'SELECT * FROM quiz_question'
    var diff, cat, gen = null
    if (difficulty != null || category != null || generation != null) {

        if (difficulty != null) {
            diff = `difficulty=${difficulty}`
        }
        if (category != null && category != "any") {
            cat = `category='${category}'`
        }
        if (generation != null && generation != 0) {
            gen = `generation IN (${generation})`
        }

        squery += ` WHERE ${diff ? `${diff}` : `1=1`} AND ${cat ? `${cat}` : `1=1`} AND ${gen ? `${gen}` : `1=1`}`
    }


    try {
        var client = new pg.Client(conString);
        await client.connect()
        console.log('Client connected')

        const { rows } = await client.query(squery)


        res.send(rows)
        await client.end()
    }
    catch (ex) {
        console.log("Some error" + ex)
    }
    finally {
        await client.end()
    }
})

//GET ANSWERS BASED ON QUESTIONID
app.get('/api/answers/:qid', async (req, res) => {
    const qid = Number(req.params.qid)
    console.log("Retrieving answers for question", qid)
    try {
        var client = new pg.Client(conString);
        await client.connect()
        console.log('Client connected')

        const { rows } = await client.query(`SELECT * FROM quiz_answer WHERE qid=${qid}`)

        res.send(rows)
        await client.end()
    }
    catch (ex) {
        console.log("Some error" + ex)
    }
    finally {
        await client.end()
    }
})

//GET UNCATEGORIZED ANSWERS BASED ON QUESTIONID
app.get('/api/answers/content/:qid', async (req, res) => {
    const qid = Number(req.params.qid)
    console.log("Retrieving answers for question", qid)
    try {
        var client = new pg.Client(conString);
        await client.connect()
        console.log('Client connected')

        const { rows } = await client.query(`SELECT id, content FROM quiz_answer WHERE qid=${qid}`)

        res.send(rows)
        await client.end()
    }
    catch (ex) {
        console.log("Some error" + ex)
    }
    finally {
        await client.end()
    }
})

//CHECK ANSWER
app.get('/api/checkanswer', async (req, res) => {
    const id = Number(req.query.id)
    console.log("Checking answer ", id)
    try {
        var client = new pg.Client(conString);
        await client.connect()
        console.log('Client connected')

        const { rows } = await client.query(`SELECT correct FROM quiz_answer WHERE id=${id}`)

        res.send(rows)
        await client.end()
    }
    catch (ex) {
        console.log("Some error" + ex)
    }
    finally {
        await client.end()
    }
})

//GET AVERAGE FOR QUESTION
app.get('/api/checkaverage', async (req, res) => {
    const qid = Number(req.query.qid)
    console.log("Checking averages for question", qid)
    try {
        var client = new pg.Client(conString);
        await client.connect()
        console.log('Client connected')

        const { rows } = await client.query(`SELECT AVG(correct) FROM qotd_responses WHERE qid = ${qid}`)

        res.send(rows)
        await client.end()
    }
    catch (ex) {
        console.log("Some error" + ex)
    }
    finally {
        await client.end()
    }
})

//SUBMIT ANSWER TO DB
app.post('/api/submitanswer', async (req, res) => {
    const qid = Number(req.query.qid)
    const aid = Number(req.query.aid)
    console.log("Submitting answer ", aid, " for question", qid)
    try {
        var client = new pg.Client(conString);
        await client.connect()
        console.log('Client connected')

        const { rows } = await client.query(`INSERT INTO qotd_responses (qid, aid, correct)
        SELECT ${qid}, ${aid}, correct
        FROM quiz_answer
        where quiz_answer.id = ${aid}`)

        res.send(rows)
        await client.end()
    }
    catch (ex) {
        console.log("Some error" + ex)
    }
    finally {
        await client.end()
    }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})