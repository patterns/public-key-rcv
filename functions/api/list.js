/**
 * GET /api/list
 */
export async function onRequestGet(context) {
  try {
    ////let input = await context.request.formData();
    const KV = context.env.VERIFIER_KEYS;
    const list = await KV.list({ limit: 10 });
    if (!list) {
      return new Response('zero data list', { status: 400 });
    }

    let output = {};
    for (let [key, value] of list) {
      let tmp = output[key];
      if (tmp === undefined) {
        output[key] = value;
      } else {
        output[key] = [].concat(tmp, value);
      }
    }


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
