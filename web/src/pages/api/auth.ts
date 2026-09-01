import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = ({ redirect }) => {
  const clientId = process.env.OAUTH_CLIENT_ID
  if (!clientId) {
    return new Response(
      'OAUTH_CLIENT_ID environment variable is missing on Vercel',
      { status: 500 }
    )
  }

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize')
  githubAuthUrl.searchParams.set('client_id', clientId)
  githubAuthUrl.searchParams.set('scope', 'repo')

  return redirect(githubAuthUrl.toString(), 302)
}
