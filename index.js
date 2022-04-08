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

app.use(express.static('build'));
app.use(express.json());
app.use(cors());

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

app.get('/api/notes/:id', (req, res, next) => {
    const id = req.params.id;
    Note.findById(id)
        .then(foundNote => {
            if (foundNote) {
                res.json(foundNote);
            } else {
                res.status(404).end();
            }
        })
        .catch(err => next(err));
});

app.delete('/api/notes/:id', (req, res, next) => {
    const id = req.params.id;
    Note.findByIdAndRemove(id)
        .then(result => {
            res.status(204).end();
        })
        .catch(err => next(err));
});

app.put('/api/notes/:id', (req, res, next) => {
    const id = req.params.id;
    const body = req.body;
    const note = {
        content: body.content,
        important: body.important
    }
    Note.findByIdAndUpdate(id, note, { new: true })
        .then(updatedNote => res.json(updatedNote))
        .catch(err => next(err));
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({
        error: 'Unknown Endpoint'
    });
};

app.use(unknownEndpoint);

const errorHandler = (err, req, res, next) => {
    console.error(err.message);

    if (err.name === 'CastError') {
        return res.status(400).send({ error: 'malformed object id' });
    }
    next(err);
}

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});