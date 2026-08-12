import type { AppLog } from './models'

function logKey (log: AppLog): string {
  if (log.id !== undefined) {
    return `id:${log.id}`
  }

  return [
    log.task_id ?? '',
    log.created_at ?? '',
    log.level,
    log.category,
    log.message,
  ].join('|')
}

export function appendUniqueLogs (current: AppLog[], incoming: AppLog[]): AppLog[] {
  const result = [...current]
  const known = new Set(current.map(log => logKey(log)))

  for (const log of incoming) {
    const key = logKey(log)
    if (known.has(key)) {
      continue
    }
    known.add(key)
    result.push(log)
  }

  return result
}

export function getLatestLogId (logs: AppLog[]): number | undefined {
  return logs.reduce<number | undefined>((latest, log) => {
    if (log.id === undefined) {
      return latest
    }
    return latest === undefined ? log.id : Math.max(latest, log.id)
  }, undefined)
}
