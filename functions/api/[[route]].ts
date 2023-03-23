import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import * as model from './model'

type Bindings = {
  PUBLIC_KEYS: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()


app.post('/keys', async (c) => {
  const input = await c.req.json()
  const loc = input('locator')
  const key = await model.getKey(c.env.PUBLIC_KEYS, loc)
  if (!key) {
    // attempt to refresh local copy of public key
    const response = await fetch(loc)
    if (response.status == 200) {
        const param = new model.Param({ locator: loc, body: response.body })
        const fresh = await model.createKey(c.env.PUBLIC_KEYS, param)
        return c.json({ key: fresh, ok: true })
    }
    return c.json({ error: 'Not Found', ok: false }, 404)
  }
  return c.json({ key: key, ok: true })
})

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello CF from Hono!',
  })
})

export const onRequest = handle(app, '/api')
