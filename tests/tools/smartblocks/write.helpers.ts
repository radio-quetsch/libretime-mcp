import { vi } from 'vitest'
import { jsonResponse } from '../../helpers.js'

type Route = { method: string; match: string; body: unknown; ok?: boolean }

/**
 * Stubs global fetch with method + URL routing and returns the spy,
 * so tests can assert which requests were (not) sent.
 */
export function stubRoutes(routes: Route[]) {
  const spy = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET'
    const route = routes.find((r) => r.method === method && url.includes(r.match))
    if (!route) throw new Error(`Unexpected request: ${method} ${url}`)
    return Promise.resolve(jsonResponse(route.body, route.ok ?? true))
  })
  vi.stubGlobal('fetch', spy)
  return spy
}

export const sentMethods = (spy: ReturnType<typeof vi.fn>) =>
  spy.mock.calls.map(([, init]) => (init as RequestInit | undefined)?.method ?? 'GET')

export const sentBody = (spy: ReturnType<typeof vi.fn>, method: string) => {
  const call = spy.mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === method)
  return call ? JSON.parse((call[1] as RequestInit).body as string) : undefined
}

/** Body of the first request matching both method and URL fragment. */
export const sentBodyTo = (spy: ReturnType<typeof vi.fn>, method: string, urlPart: string) => {
  const call = spy.mock.calls.find(([url, init]) => (init as RequestInit | undefined)?.method === method && String(url).includes(urlPart))
  return call ? JSON.parse((call[1] as RequestInit).body as string) : undefined
}

/** Number of requests sent with the given method whose URL contains the fragment. */
export const countRequests = (spy: ReturnType<typeof vi.fn>, method: string, urlPart: string) =>
  spy.mock.calls.filter(([url, init]) => ((init as RequestInit | undefined)?.method ?? 'GET') === method && String(url).includes(urlPart)).length
