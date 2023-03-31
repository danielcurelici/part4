const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'first blog',
    author: 'Dan',
    url: 'url1',
    likes: 10,
  },
  {
    title: 'second blog',
    author: 'Tom',
    url: 'url2',
    likes: 5,
  },
]

const dummy = () => {
  return 1
}
const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => {
    return sum + blog.likes
  }, 0)
}

const favoriteBlog = (blogs) => {
  const likesList = []
  for(let blog of blogs)
    likesList.push(blog.likes)
  const max = Math.max(...likesList)
  return blogs.find(b => b.likes === max)
}
const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}
module.exports = {
  initialBlogs, dummy, totalLikes, favoriteBlog, blogsInDb
}
