import { createRequest, createResponse } from 'node-mocks-http'
import registerHandler from '../../pages/api/auth/register'
import loginHandler from '../../pages/api/auth/login'
import createPostHandler from '../../pages/api/posts/create'
import likeHandler from '../../pages/api/posts/[id]/like'
import prisma from '../../lib/prisma'

jest.setTimeout(20000)

test('register → login → create post → like toggle', async () => {
  const email = `test+${Date.now()}@example.com`
  const password = 'TestPass123!'

  // Register PRO user
  const regReq = createRequest({ method: 'POST', body: { email, password, name: 'Test Pro', role: 'PRO' } })
  const regRes = createResponse()
  await registerHandler(regReq as any, regRes as any)
  expect(regRes._getStatusCode()).toBe(201)
  const regData = regRes._getJSONData()
  expect(regData).toHaveProperty('id')
  const userId = regData.id

  // Login to get cookie
  const loginReq = createRequest({ method: 'POST', body: { email, password } })
  const loginRes = createResponse()
  await loginHandler(loginReq as any, loginRes as any)
  expect(loginRes._getStatusCode()).toBe(200)
  const headers = loginRes._getHeaders()
  const setCookie = headers['set-cookie'] || headers['Set-Cookie']
  expect(setCookie).toBeDefined()
  const raw = Array.isArray(setCookie) ? setCookie[0] : setCookie as string
  const cookie = raw.split(';')[0]

  // Create a post as PRO
  const body = {
    mediaUrls: ['https://example.com/img.jpg'],
    caption: 'Test post',
    styleTags: ['fade'],
    hairTypeTags: ['curly'],
    location: 'Test City',
    estimatedDurationMinutes: 30
  }
  const postReq = createRequest({ method: 'POST', headers: { cookie }, body })
  const postRes = createResponse()
  await createPostHandler(postReq as any, postRes as any)
  expect(postRes._getStatusCode()).toBe(201)
  const post = postRes._getJSONData()
  expect(post).toHaveProperty('id')
  const postId = post.id

  // Like the post (should return liked: true)
  const likeReq = createRequest({ method: 'POST', headers: { cookie }, query: { id: String(postId) } })
  const likeRes = createResponse()
  await likeHandler(likeReq as any, likeRes as any)
  expect(likeRes._getStatusCode()).toBe(200)
  const likeData = likeRes._getJSONData()
  expect(likeData).toHaveProperty('liked', true)
  expect(likeData).toHaveProperty('likeCount', 1)

  // Toggle like off
  const likeReq2 = createRequest({ method: 'POST', headers: { cookie }, query: { id: String(postId) } })
  const likeRes2 = createResponse()
  await likeHandler(likeReq2 as any, likeRes2 as any)
  expect(likeRes2._getStatusCode()).toBe(200)
  const likeData2 = likeRes2._getJSONData()
  expect(likeData2).toHaveProperty('liked', false)
  expect(likeData2).toHaveProperty('likeCount', 0)

  // Cleanup: remove post and user
  await prisma.like.deleteMany({ where: { postId } }).catch(()=>{})
  await prisma.post.delete({ where: { id: postId } }).catch(()=>{})
  await prisma.professionalProfile.deleteMany({ where: { userId } }).catch(()=>{})
  await prisma.user.delete({ where: { id: userId } }).catch(()=>{})
})

afterAll(async () => {
  await prisma.$disconnect()
})
