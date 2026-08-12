import type { PlatformConfig } from '@/modules/platform/domain/models'

export interface PlatformRepository {
  getConfig: () => Promise<PlatformConfig>
}
