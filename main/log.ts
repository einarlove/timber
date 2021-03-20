import ms from "ms"
import consola from "consola"

export function time(scope: string, message: string) {
  const start = new Date()
  function resolve() {
    consola.log(`[${scope}]: ${message} – ${ms(new Date().getTime() - start.getTime())}`)
  }
  function reject(error: Error | string) {
    consola.fatal(`[${scope}]: ${message} – ${ms(new Date().getTime() - start.getTime())}`)
    consola.error(error)
  }
  return { resolve, reject }
}
