const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Note = require('../models/note')
const User = require('../models/user')

const api = supertest(app)


beforeEach(async () => {
	await Note.deleteMany({})
	await Note.insertMany(helper.initialNotes)
	await User.deleteMany({})
	const passwordHash = await bcrypt.hash('miguel', 10)
	const user = new User({ username: 'root', passwordHash })
	await user.save()
})

describe('when there are initially some notes saved', () => {
	test('notes are returned as JSON', async () => {
		await api
			.get('/api/notes')
			.expect(200)
			.expect('Content-Type', /application\/json/)
	})

	test('all notes are returned', async () => {
		const response = await api.get('/api/notes')
		expect(response.body).toHaveLength(helper.initialNotes.length)
	})

	test('a specific note is within the returned notes', async () => {
		const response = await api.get('/api/notes')
		const contents = response.body.map(r => r.content)
		expect(contents).toContain('Browser can execute only Javascript')
	})
})

describe('viewing a specific note', () => {
	test('succeeds with a valid id', async () => {
		const notesAtStart = await helper.notesInDb()
		const noteToView = notesAtStart[0]

		const resultNote = await api
			.get(`/api/notes/${noteToView.id}`)
			.expect(200)
			.expect('Content-Type', /application\/json/)

		const processedNoteToView = JSON.parse(JSON.stringify(noteToView))
		expect(resultNote.body).toEqual(processedNoteToView)
	})

	test('fails with status code 400 if id is invalid', async () => {
		const invalidId = 'miguel12'
		await api
			.get(`/api/notes/${invalidId}`)
			.expect(400)
	})

	test('fails with status code 404 if note does not exist', async () => {
		const validNonExistingId = await helper.nonExistingId()
		await api
			.get(`/api/notes/${validNonExistingId}`)
			.expect(404)
	})
})

describe('addition of a new note', () => {
	let token = null
	beforeEach(async () => {
		await User.deleteMany({})
		const passwordHash = await bcrypt.hash('miguel', 10)
		const user = new User({ username: 'root', passwordHash })
		await user.save()
		// Get a token to simulate a user being logged in
		const loginResponse = await api
			.post('/api/login')
			.send({
				username: user.username,
				password: 'miguel'
			})
		token = loginResponse.body.token
	})
	test('succeeds with valid data', async () => {
		const newNote = {
			content: 'async/await simplifies making async calls',
			important: true,
		}

		await api
			.post('/api/notes')
			.set('Authorization', `bearer ${token}`)
			.send(newNote)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const notesAtEnd = await helper.notesInDb()
		const contents = notesAtEnd.map(n => n.content)

		expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)
		expect(contents).toContain('async/await simplifies making async calls')
	})

	test('fails with status code 400 if data is invalid', async () => {
		const newNote = {
			important: true
		}
		await api
			.post('/api/notes')
			.set('Authorization', `bearer ${token}`)
			.send(newNote)
			.expect(400)

		const notesAtEnd = await helper.notesInDb()
		expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
	})
})

describe('deletion of a note', () => {
	test('succeeds with status code 204 if id is valid', async () => {
		const notesAtStart = await helper.notesInDb()
		const noteToDelete = notesAtStart[0]

		await api
			.delete(`/api/notes/${noteToDelete.id}`)
			.expect(204)

		const notesAtEnd = await helper.notesInDb()
		expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1)

		const contents = notesAtEnd.map(n => n.content)
		expect(contents).not.toContain(noteToDelete.content)
	})
})

describe('when there is initially one user in the db', () => {
	test('creation succeeds with a fresh username', async () => {
		const usersAtStart = await helper.usersInDb()
		const newUser = {
			username: 'zlatan123',
			name: 'Zlatan Ibrahimovic',
			password: 'zlatan'
		}
		await api
			.post('/api/users')
			.send(newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

		const usernames = usersAtEnd.map(u => u.username)
		expect(usernames).toContain(newUser.username)
	})

	test('creation fails with proper status code and message if username taken', async () => {
		const usersAtStart = await helper.usersInDb()
		const newUser = {
			username: 'root',
			password: 'rootpass'
		}
		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('username must be unique')
		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toEqual(usersAtStart)
	})
})

afterAll(() => {
	mongoose.connection.close()
})