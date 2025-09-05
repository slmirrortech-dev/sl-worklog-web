export interface ProcessModel {
  id: string
  name: string
  order: number
}
export interface LineModel {
  id: string
  name: string
  order: number
  processesLength: number
  processes: ProcessModel[]
}
