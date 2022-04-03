const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
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

const generateID = () => {
    const maxID = notes.length > 0
        ? Math.max(...notes.map(n => n.id))
        : 0;
    return maxID + 1;
}

app.get('/', (req, res) => {
    res.send(`<h1>Hello World!</h1>`);
});

app.get('/api/notes', (req, res) => {
    res.json(notes);
});

app.post('/api/notes', (req, res) => {
    const body = req.body;

    if (!body.content) {
        return res.status(400).json({
            error: 'Content missing'
        });
    }

    const note = {
        content: body.content,
        important: body.important || false,
        date: new Date(),
        id: generateID(),
    }
    notes = notes.concat(note);
    res.json(note);
})

app.get('/api/notes/:id', (req, res) => {
    const id = req.params.id;
    const note = notes.find(n => n.id === parseInt(id));
    if (note) {
        res.json(note);
    } else {
        res.status(404).end();
    }
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});