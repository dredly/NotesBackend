if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const Note = require('./models/note');
const mongoose = require('mongoose');
const { response } = require('express');

const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
    .then(result => {
        console.log('Connected to mongo');
    })
    .catch(err => {
        console.log('Error connecting to mongo', err.message);
    });

const app = express();

app.use(express.json());
app.use(express.static('build'));
app.use(cors());

let notes = [
    {
        id: 1,
        content: "HTML is easy",
        date: "2022-05-30T17:30:31.098Z",
        important: true
    },
    {
        id: 2,
        content: "Browser can execute only Javascript",
        date: "2022-05-30T18:39:34.091Z",
        important: false
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        date: "2022-05-30T19:20:14.298Z",
        important: true
    }
];

app.get('/', (req, res) => {
    res.send(`<h1>Hello World!</h1>`);
});

app.get('/api/notes', (req, res) => {
    Note.find({}).then(notes => {
        res.json(notes);
    })
});

app.post('/api/notes', (req, res) => {
    const body = req.body;

    if (!body.content) {
        return res.status(400).json({
            error: 'Content missing'
        });
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    });
    note.save().then(savedNote => {
        res.json(savedNote);
    });
})

app.get('/api/notes/:id', (req, res) => {
    const id = req.params.id;
    Note.findById(id).then(foundNote => {
        res.json(foundNote);
    })
});

app.delete('/api/notes/:id', (req, res) => {
    const id = req.params.id;
    notes = notes.filter(n => n.id !== parseInt(id));
    res.status(204).end()
});

const unknownEndpoint = (req, res) => {
    res.status(404).send({
        error: 'Unknown Endpoint'
    });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});