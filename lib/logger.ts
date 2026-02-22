/**
 * @design-guard
 * role: Structured logger wrapper — only file allowed to use console methods directly
 * layer: core
 * non_goals:
 *   - Log persistence or shipping
 *   - Log level filtering
 * boundaries:
 *   depends_on: []
 *   exposes: [logger]
 * invariants:
 *   - All application logging goes through this module
 *   - Biome noConsole rule exempts only this file
 * authority:
 *   decides: [Logging interface, output format]
 *   delegates: [Console output to runtime]
 * extension_policy: Add log levels (debug, trace) as needed
 * failure_contract: Never throws — logging failures are silently dropped
 * testing_contract: Verify logger methods call correct console methods
 * references: [biome.json noConsole overrides]
 */
function createLogger() {
  return {
    error: (...args: unknown[]) => console.error(...args),
    warn: (...args: unknown[]) => console.warn(...args),
    info: (...args: unknown[]) => console.info(...args),
  };
}

export const logger = createLogger();
