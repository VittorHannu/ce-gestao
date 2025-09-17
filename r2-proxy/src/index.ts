/**
 * An environment variable for the R2 bucket binding.
 */
export interface Env {
	MY_BUCKET: R2Bucket;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// The object key is derived from the URL path.
		// e.g., a request to "https://worker.dev/path/to/image.jpg"
		// will look for the object "path/to/image.jpg" in the bucket.
		const key = url.pathname.slice(1);

		// We only want to proxy GET requests.
		if (request.method !== 'GET') {
			return new Response('Method Not Allowed', { status: 405 });
		}

		// If the key is empty (root access), return a simple message.
		if (key === '') {
			return new Response('This is an R2 proxy worker. Access objects by specifying their key in the URL path.', { status: 200 });
		}

		// Retrieve the object from R2.
		const object = await env.MY_BUCKET.get(key);

		// If the object is not found, return a 404 response.
		if (object === null) {
			return new Response(`Object Not Found: ${key}`, { status: 404 });
		}

		// Prepare the response headers.
		// The `writeHttpMetadata` method copies standard headers
		// like Content-Type, Content-Language, etc. from the R2 object.
		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set('etag', object.httpEtag); // Set the ETag for browser caching.
		headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

		// Stream the object's body directly to the response.
		// This is highly efficient as it avoids buffering the entire file in memory.
		return new Response(object.body, {
			headers,
		});
	},
};
