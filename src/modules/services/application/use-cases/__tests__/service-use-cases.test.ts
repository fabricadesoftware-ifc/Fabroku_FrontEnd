import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'

import { CreateService, ListProjectServices } from '../service-use-cases.ts'

describe('Services use cases', () => {
  it('lists services by project through the repository port', async () => {
    let requestedProject = ''
    const useCase = new ListProjectServices({
      getByProject: async (projectId: string) => {
        requestedProject = projectId
        return { count: 0, next: null, previous: null, results: [] }
      },
    } as never)

    await useCase.execute('project-1')

    assert.equal(requestedProject, 'project-1')
  })

  it('creates a service without changing the input contract', async () => {
    const input = { project: 'project-1', service_type: 'redis' as const }
    const useCase = new CreateService({
      create: async (received: typeof input) => ({ ...received, name: 'cache' }),
    } as never)

    const service = await useCase.execute(input)

    assert.equal(service.name, 'cache')
    assert.deepEqual(input, { project: 'project-1', service_type: 'redis' })
  })
})
