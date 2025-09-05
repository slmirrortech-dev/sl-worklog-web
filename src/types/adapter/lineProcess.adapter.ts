import { LineModel } from '@/types/models/lineProcess.model'
import { LineResponseDto } from '@/types/dto/lineProcess.dto'

export function toLineProcessModel(dto: LineResponseDto): LineModel {
  const processes = dto.processes ?? []

  return {
    id: dto.id,
    name: dto.name,
    order: dto.order,
    processesLength: processes.length,
    processes: processes.map((p) => ({
      id: p.id,
      name: p.name,
      order: p.order,
    })),
  }
}
