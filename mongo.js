const mongoose = require('mongoose')

if (process.argv.length < 3) {
	console.log('Please provide the password as an argument: node mongo.js <password>')
	process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://notes:${password}@cluster0.be3y0.mongodb.net/noteapp?retryWrites=true&w=majority`
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
	content: String,
	date: Date,
	important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

// const note = new Note({
//     content: 'JS is weird',
//     date: new Date(),
//     important: true,
// });

// note.save().then(() => {
//     console.log('Note has been saved!');
//     mongoose.connection.close();
// })

Note.find({}).then(result => {
	result.forEach(note => {
		console.log(note)
	})
	mongoose.connection.close()
})