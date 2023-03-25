import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import * as model from './model'

type Bindings = {
  VERIFIER_KEYS: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()


app.post('/verifiers', async (c) => {
  const input = await c.req.json()
  const loc = input('locator')
  const verifier = await model.getVerifier(c.env.VERIFIER_KEYS, loc)
  if (!verifier) {
    // attempt to refresh local copy of verifier key
    const response = await fetch(loc)
    if (response.status == 200) {
        const param = new model.Param({ locator: loc, body: response.body })
        const fresh = await model.createVerifier(c.env.VERIFIER_KEYS, param)
        return c.json({ verifier: fresh, ok: true })
    }
    return c.json({ error: 'Not Found', ok: false }, 404)
  }
  return c.json({ verifier: verifier, ok: true })
})


const route2 = app.get('/list', async (c) => {
  const seqnums = await model.listSequenceNumbers(c.env.VERIFIER_KEYS)
  return c.jsonT({
      collection: seqnums,
  })
}
)

const route = app.get(
  '/hello',
  zValidator(
    'query',
    z.object({
      name: z.string(),
    })
  ),
  (c) => {
    const { name } = c.req.valid('query')
    return c.jsonT({
      message: `Hello ${name}!`,
    })
  }
)

export type AppType = typeof route
export type AppType2 = typeof route2

export const onRequest = handle(app, '/api')
