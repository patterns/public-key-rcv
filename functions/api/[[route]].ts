import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'

const app = new Hono()

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello CF from Hono!',
  })
})

export const onRequest = handle(app, '/api')
