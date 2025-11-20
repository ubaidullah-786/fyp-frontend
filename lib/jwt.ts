export type JwtPayload = { id?: string; iat?: number; exp?: number; [k: string]: any }

export function decodeJwt(token: string | null | undefined): JwtPayload | null {
  if (!token) return null
  try {
    const [, payload] = token.split(".")
    const json = atob(payload.replaceAll("-", "+").replaceAll("_", "/"))
    return JSON.parse(json)
  } catch {
    return null
  }
}
