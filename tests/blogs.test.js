const helper = require('../utils/list_helper')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})


test('dummy returns one', () => {
  const result = helper.dummy([])
  expect(result).toBe(1)
})

describe('totalLikes', () => {
  const listWithManyBlog = [
    { likes:5, author: 'Dan' },
    { likes:2, author: 'Ben' },
    { likes:3, author: 'Dan' }
  ]
  const listWithOneBlog = [{ likes:5 }]

  it('when list has many blogs, return the sume of likes of all blogs', () => {
    expect(helper.totalLikes(listWithManyBlog)).toBe(10)
  })
  it('when list has only one blog, equals the likes of that', () => {
    expect(helper.totalLikes(listWithOneBlog)).toBe(5)
  })
})

describe('favoriteBlog', () => {
  const listWithManyBlog = [{ likes:5 }, { likes:2 }, { likes:3 }]

  it('when list has many blogs, return the blog with the higher likes number', () => {
    expect(helper.favoriteBlog(listWithManyBlog)).toEqual({ likes:5 })
  })
})

test('blogs are returned as json and correct amount', async () => {

  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
    .expect(res =>  res.body.length === helper.initialBlogs.length)
}, 100000,)

test('the unique identifier property of the blog posts is named id', async () => {
  const response = await api.get('/api/blogs')
  const ids = response.body.map(r => r.id)

  for(let id of ids)
    expect(id).toBeDefined()
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'third blog',
    author: 'Don',
    url: 'url3',
    likes: 7,
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const titles = response.body.map(r => r.title)

  expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
  expect(titles).toContain('third blog')
}, 100000)

test('if the likes property is missing, it will default to 0', async () => {
  const newBlog = {
    title: 'third blog',
    author: 'Don',
    url: 'url3',
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)

  const response = await api.get('/api/blogs')
  const likes = response.body.filter(r => r.title === 'third blog')[0].likes
  expect(likes).toBe(0)
}, 100000)

test('if the title or url are missing, backend responds with 400 Bad Request.', async () => {
  const newBlog = {
    author: 'Don',
    likes: 10
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

}, 100000)


test('delete succeeds with status code 204 if id is valid', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length -1)

  const titles = blogsAtEnd.map(r => r.title)
  expect(titles).not.toContain(blogToDelete.title)
})

test('update succeeds with status code 204 if id is valid', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]
  let sendBlog = blogToUpdate
  sendBlog = { likes: 20 }

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(sendBlog)
    .expect(200)

  const blogs = await helper.blogsInDb()
  expect(blogs[0].likes).toBe(20)
})

afterAll(async () => {
  await mongoose.connection.close()
})
