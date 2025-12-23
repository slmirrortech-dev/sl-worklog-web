import React from 'react'
import { WorkerStatus } from '@prisma/client'

interface SlotWorker {
  id: string
  userId: string
  name: string
  licensePhotoUrl: string | null
}

interface ProcessSlot {
  id: string
  name: string
  slotIndex: number
  workerId: string | null
  worker: SlotWorker | null
  workerStatus: WorkerStatus
}

interface AreaWaitingWorkerProps {
  slot: ProcessSlot
}

const AreaWaitingWorker = ({ slot }: AreaWaitingWorkerProps) => {
  const { worker, workerStatus } = slot

  if (!worker) {
    return <div className="w-full h-full" />
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center gap-1 p-2 min-w-0">
      <p
        className="flex items-center justify-center gap-[0.2vw] font-semibold leading-tight text-center w-full"
        style={{
          fontSize: 'clamp(0.875rem, 1.2vw, 1.25rem)',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        <span
          className="relative flex mr-1"
          style={{
            width: 'clamp(6px, 0.5vw, 10px)',
            height: 'clamp(6px, 0.5vw, 10px)',
          }}
        >
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
              workerStatus === 'NORMAL'
                ? 'bg-green-400'
                : workerStatus === 'OVERTIME' && 'bg-yellow-400'
            } opacity-75`}
          ></span>
          <span
            className={`relative inline-flex rounded-full h-full w-full ${
              workerStatus === 'NORMAL'
                ? 'bg-green-500'
                : workerStatus === 'OVERTIME' && 'bg-yellow-400'
            }`}
          ></span>
        </span>
        {worker.name}
      </p>
      <span
        className="font-normal text-gray-500 leading-tight text-center"
        style={{
          fontSize: 'clamp(0.75rem, 0.9vw, 1rem)',
          wordBreak: 'keep-all',
        }}
      >
        ({worker.userId})
      </span>
    </div>
  )
}

export default AreaWaitingWorker
