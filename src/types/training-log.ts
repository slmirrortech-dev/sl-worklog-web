export type TrainingLogResponse = {
  id: string
  trainedAt: string
  title: string
  instructor: string
}

export type TrainingLogCreateRequest = {
  trainedAt: string
  workerId: string
  title: string
  instructor: string
}