/**
 * POST /api/put
 */
export async function onRequestPost(context) {

  /**
   * gatherResponse awaits and returns a response body as a string.
   * Use await gatherResponse(..) in an async function to get the response body
   * @param {Response} response
   */
  async function gatherResponse(response) {
    const { headers } = response;
    const contentType = headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return JSON.stringify(await response.json());
    }
    return response.text();
  }

  try {
    //TODO check for authorization

    let input = await context.request.json();
    const destination = input.locator;
    if (!destination) {
      return new Response('Missing locator input field', { status: 400 });
    }

    // TODO check whether we have a cached version first before making a trip
    // retrieve the public key (as specified by keyId)
    const response = await fetch(destination, {
      headers: {'Accept': 'application/activity+json'},
      cf: {cacheTtl: 5, cacheEverything: true},
    });
    const results = await gatherResponse(response);

    // use the SHA256 sum as our internal sequence
    const enc = new TextEncoder().encode(destination);
    const sum = await crypto.subtle.digest({name: 'SHA-256'}, enc);
    const internal_seq = btoa(String.fromCharCode(...new Uint8Array(sum)));
    const KV = context.env.VERIFIER_KEYS;
    await KV.put(internal_seq, results, {expirationTtl: 3600});

    // return feedback to the consumer
    const output = { detail: "store done" };
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
