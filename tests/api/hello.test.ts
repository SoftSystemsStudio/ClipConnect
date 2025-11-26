import handler from '../../pages/api/hello'
import { createRequest, createResponse } from 'node-mocks-http'

test('GET /api/hello returns status ok', async () => {
  const req = createRequest({ method: 'GET' })
  const res = createResponse()
  await handler(req as any, res as any)
  expect(res._getStatusCode()).toBe(200)
  const data = res._getJSONData()
  expect(data).toHaveProperty('status', 'ok')
  expect(data).toHaveProperty('time')
})
