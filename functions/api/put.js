/**
 * POST /api/put
 */
export async function onRequestPost(context) {
  try {
    //TODO accept json data
    let input = await context.request.formData();
    const loc = input.get('locator');
    if (!loc) {
      return new Response('Missing locator input field', { status: 400 });
    }

    // use the SHA256 sum as our internal sequence
    const internal_seq = crypto.subtle.digest({name: 'SHA-256'}, loc);
    const KV = context.env.VERIFIER_KEYS;
    await KV.put(internal_seq, loc, {expirationTtl: 3600});
    let output = { detail: "store done" };
    let pretty = JSON.stringify(output, null, 2);
    return new Response(pretty, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
    });
  } catch (err) {
    return new Response('Error parsing JSON content', { status: 400 });
  }
}
