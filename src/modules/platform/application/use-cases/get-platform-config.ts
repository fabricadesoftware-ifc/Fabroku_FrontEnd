import type { PlatformRepository } from '@/modules/platform/application/ports/platform-repository'
import type { PlatformConfig } from '@/modules/platform/domain/models'

export class GetPlatformConfig {
  constructor (private readonly repository: PlatformRepository) {}

  execute (): Promise<PlatformConfig> {
    return this.repository.getConfig()
  }
}
