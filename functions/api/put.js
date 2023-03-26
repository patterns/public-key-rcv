/**
 * POST /api/put
 */
export async function onRequestPost(context) {
  try {
    let input = await context.request.formData();
    const loc = input.get('locator');
    if (!loc) {
      return new Response('input missing locator field', { status: 400 });
    }

    const internal_seq = crypto.randomUUID();
    const KV = context.env.VERIFIER_KEYS;
    await KV.put(internal_seq, loc);
    let output = { detail: "put completed" };
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
