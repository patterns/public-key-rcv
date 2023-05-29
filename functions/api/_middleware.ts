import type { PluginData } from "@cloudflare/pages-plugin-honeycomb";

export const onRequest: PagesFunction<unknown, any, PluginData> = async ({
    data,
    next,
    request
}) => {
  // debug trace input fields (of verifier that we're proxying for the consumer)
  data.honeycomb.tracer.addData({ 
    method: request.method,
    url: request.url,
    body: request.body,
    host: request.headers.get('host'),
    date: request.headers.get('date'),
    contenttype: request.headers.get('content-type'),
    digest: request.headers.get('digest'),
    contentlength: request.headers.get('content-length'),
    signature: request.headers.get('signature'),
  });
  return next();
};

