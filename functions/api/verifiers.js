/**
 * POST /api/verifiers
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
    //TODO refactor to use HMAC after e2e
    const hdr_field = context.env.PRESHARED_AUTH_HEADER_KEY;
    const psk = context.request.headers.get(hdr_field);
    if (psk !== context.env.PRESHARED_AUTH_HEADER_VALUE) {
      return new Response('Required auth value', { status: 403 });
    }

    let input = await context.request.json();
    if (!input.locator) {
      return new Response('Missing locator input field', { status: 400 });
    }
    // TypeError exception is thrown on invalid URLs
    const destination = new URL(input.locator);

    // use the SHA256 sum as our internal sequence
    const enc = new TextEncoder().encode(destination.href);
    const sum = await crypto.subtle.digest({name: 'SHA-256'}, enc);
    const internal_seq = btoa(String.fromCharCode(...new Uint8Array(sum)));

    // prefer local copy and saving a trip
    const KV = context.env.VERIFIER_KEYS;
    const from_cache = await KV.get(internal_seq);
    if (from_cache != null) {
      // TODO short-circuit when wrong format from public key (save consumer grief)
      return new Response(from_cache, {
        headers:{'Content-Type': 'application/json;charset=utf-8'},
      });
    }

    // retrieve a fresh version (as specified by keyId)
    const response = await fetch(destination, {
      headers: {'Accept': 'application/activity+json'},
      cf: {cacheTtl: 5, cacheEverything: true},
    });
    const results = await gatherResponse(response);

    // keep a local copy of the public key
    await KV.put(internal_seq, results, {expirationTtl: 3600});

    // pass back fresh (keyId) to the consumer
    return new Response(results, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
    });
  } catch (err) {
    return new Response('Error parsing JSON content', { status: 400 });
  }
}
