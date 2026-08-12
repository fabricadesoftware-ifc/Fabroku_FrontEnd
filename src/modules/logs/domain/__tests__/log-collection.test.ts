import type { AppLog } from '../models.ts'
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { appendUniqueLogs, getLatestLogId } from '../log-collection.ts'

const baseLog: AppLog = {
  id: 10,
  app: 1,
  task_id: 'task-1',
  message: 'Build iniciado',
  level: 'INFO',
  category: 'DEPLOY',
}

test('adiciona logs novos sem duplicar itens reenviados pelo stream', () => {
  const duplicate = { ...baseLog }
  const next = { ...baseLog, id: 11, message: 'Build concluido' }

  assert.deepEqual(appendUniqueLogs([baseLog], [duplicate, next]), [baseLog, next])
})

test('calcula o maior id mesmo quando a resposta não está ordenada', () => {
  assert.equal(getLatestLogId([{ ...baseLog, id: 18 }, { ...baseLog, id: 12 }]), 18)
})
