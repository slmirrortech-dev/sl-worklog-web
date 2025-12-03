import { WorkClass } from '@prisma/client'

export type WorkClassResponseDto = WorkClass

export type WorkClassRequestModel = WorkClass

export type FactoryConfigRequest = {
  processCount: number
}

export type FactoryConfigResponse = {
  id: string
  processCount: number
}
