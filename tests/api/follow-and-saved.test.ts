import { createRequest, createResponse } from 'node-mocks-http'
import registerHandler from '../../pages/api/auth/register'
import loginHandler from '../../pages/api/auth/login'
import followHandler from '../../pages/api/follow/toggle'
import createPostHandler from '../../pages/api/posts/create'
import savedHandler from '../../pages/api/saved/toggle'
import prisma from '../../lib/prisma'

jest.setTimeout(20000)

test('client can follow/unfollow a pro and save/unsave a post', async () => {
  const proEmail = `pro+${Date.now()}@example.com`
  const clientEmail = `client+${Date.now()}@example.com`
  const password = 'TestPass123!'

  // Register PRO
  const regProReq = createRequest({ method: 'POST', body: { email: proEmail, password, name: 'Pro', role: 'PRO' } })
  const regProRes = createResponse()
  await registerHandler(regProReq as any, regProRes as any)
  const pro = regProRes._getJSONData()

  // Register CLIENT
  const regClientReq = createRequest({ method: 'POST', body: { email: clientEmail, password, name: 'Client', role: 'CLIENT' } })
  const regClientRes = createResponse()
  await registerHandler(regClientReq as any, regClientRes as any)
  const client = regClientRes._getJSONData()

  // Login client
  const loginReq = createRequest({ method: 'POST', body: { email: clientEmail, password } })
  const loginRes = createResponse()
  await loginHandler(loginReq as any, loginRes as any)
  const setCookie = loginRes._getHeaders()['set-cookie'] || loginRes._getHeaders()['Set-Cookie']
  const raw = Array.isArray(setCookie) ? setCookie[0] : setCookie as string
  const cookie = raw.split(';')[0]

  // Client follows pro
  const followReq = createRequest({ method: 'POST', headers: { cookie }, body: { professionalId: pro.id } })
  const followRes = createResponse()
  await followHandler(followReq as any, followRes as any)
  expect(followRes._getStatusCode()).toBe(200)
  expect(followRes._getJSONData()).toHaveProperty('following', true)

  // Toggle follow off
  const followReq2 = createRequest({ method: 'POST', headers: { cookie }, body: { professionalId: pro.id } })
  const followRes2 = createResponse()
  await followHandler(followReq2 as any, followRes2 as any)
  expect(followRes2._getStatusCode()).toBe(200)
  expect(followRes2._getJSONData()).toHaveProperty('following', false)

  // Create a post by pro (login as pro to create)
  const loginProReq = createRequest({ method: 'POST', body: { email: proEmail, password } })
  const loginProRes = createResponse()
  await loginHandler(loginProReq as any, loginProRes as any)
  const setCookiePro = loginProRes._getHeaders()['set-cookie'] || loginProRes._getHeaders()['Set-Cookie']
  const rawPro = Array.isArray(setCookiePro) ? setCookiePro[0] : setCookiePro as string
  const cookiePro = rawPro.split(';')[0]

  const postBody = { mediaUrls: ['https://example.com/img.jpg'], caption: 'Pro post', styleTags: ['trim'], hairTypeTags: ['straight'], location: 'City' }
  const postReq = createRequest({ method: 'POST', headers: { cookie: cookiePro }, body: postBody })
  const postRes = createResponse()
  await createPostHandler(postReq as any, postRes as any)
  const post = postRes._getJSONData()

  // Client saves post
  const saveReq = createRequest({ method: 'POST', headers: { cookie }, body: { itemType: 'POST', itemId: post.id } })
  const saveRes = createResponse()
  await savedHandler(saveReq as any, saveRes as any)
  expect(saveRes._getStatusCode()).toBe(200)
  expect(saveRes._getJSONData()).toHaveProperty('saved', true)

  // Toggle save off
  const saveReq2 = createRequest({ method: 'POST', headers: { cookie }, body: { itemType: 'POST', itemId: post.id } })
  const saveRes2 = createResponse()
  await savedHandler(saveReq2 as any, saveRes2 as any)
  expect(saveRes2._getStatusCode()).toBe(200)
  expect(saveRes2._getJSONData()).toHaveProperty('saved', false)

  // Cleanup
  await prisma.savedItem.deleteMany({ where: { itemId: post.id } }).catch(()=>{})
  await prisma.like.deleteMany({ where: { postId: post.id } }).catch(()=>{})
  await prisma.post.delete({ where: { id: post.id } }).catch(()=>{})
  await prisma.follow.deleteMany({ where: { followedProfessionalId: pro.id } }).catch(()=>{})
  await prisma.professionalProfile.deleteMany({ where: { userId: pro.id } }).catch(()=>{})
  await prisma.clientProfile.deleteMany({ where: { userId: client.id } }).catch(()=>{})
  await prisma.user.delete({ where: { id: pro.id } }).catch(()=>{})
  await prisma.user.delete({ where: { id: client.id } }).catch(()=>{})
})

afterAll(async () => {
  await prisma.$disconnect()
})
