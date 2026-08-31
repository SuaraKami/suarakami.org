import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async ({ url }) => {
  const code = url.searchParams.get('code')
  const clientId = process.env.OAUTH_CLIENT_ID
  const clientSecret = process.env.OAUTH_CLIENT_SECRET

  if (!code) {
    return new Response('Missing code parameter', { status: 400 })
  }

  if (!clientId || !clientSecret) {
    return new Response('OAuth environment variables (OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET) are missing on Vercel', {
      status: 500,
    })
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    const data = await response.json()

    if (data.error || !data.access_token) {
      const errorContent = `authorization:github:error:${JSON.stringify(data)}`
      return new Response(
        `<!doctype html><html><body><script>
          window.opener.postMessage(${JSON.stringify(errorContent)}, '*');
          window.close();
        </script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    const token = data.access_token
    const successContent = `authorization:github:success:${JSON.stringify({ provider: 'github', token })}`

    return new Response(
      `<!doctype html><html><body><script>
        window.opener.postMessage(${JSON.stringify(successContent)}, '*');
        window.close();
      </script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  } catch (_err) {
    return new Response('Internal Server Error', { status: 500 })
  }
}
