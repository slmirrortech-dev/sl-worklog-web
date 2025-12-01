import React from 'react'
import { LineResponseDto } from '@/types/line-with-process'
import ContainerWaitingWorker from '@/app/admin/(main)/old-setting-line/_component/ContainerWaitingWorker'
import EditableLineCell from '@/app/admin/(main)/old-setting-line/_component/EditableLineCell'
import ProcessCell from '@/app/admin/(main)/old-setting-line/_component/ProcessCell'
import ButtonAddProcess from '@/app/admin/(main)/old-setting-line/_component/ButtonAddProcess'
import ShiftTypeCell from '@/app/admin/(main)/old-setting-line/_component/ShiftTypeCell'
import ButtonAddLine from '@/app/admin/(main)/old-setting-line/_component/ButtonAddLine'
import { ShiftType } from '@prisma/client'

const LineRow = ({
  isEditMode,
  isLocked,
  data,
  setLineWithProcess,
  dragAndDropControl,
  workerDropControl,
  editLineControl,
  setSaveProgress,
}: {
  isEditMode: boolean
  isLocked: boolean
  data: LineResponseDto[]
  setLineWithProcess: any
  dragAndDropControl: any
  workerDropControl: any
  editLineControl: any
  setSaveProgress: any
}) => {
  return (
    <tbody>
      {data.map((line) => {
        return (
          <React.Fragment key={line.id}>
            <tr>
              {/* 라인 셀 */}
              <EditableLineCell
                line={line}
                editLineControl={editLineControl}
                dragAndDropControl={dragAndDropControl}
                isEditMode={isEditMode}
                setSaveProgress={setSaveProgress}
              />
              <td className="flex bg-white">
                {/* 라인의 하위 공정 목록 */}
                {line.processes.map((process) => {
                  // 공정 셀
                  return (
                    <ProcessCell
                      key={process.id}
                      line={line}
                      process={process}
                      isEditMode={isEditMode}
                      dragAndDropControl={dragAndDropControl}
                      editLineControl={editLineControl}
                    />
                  )
                })}
                {/* 공정 추가 버튼  */}
                {isEditMode && (
                  <ButtonAddProcess onClick={() => editLineControl.handleAddProcess(line.id)} />
                )}
              </td>
            </tr>

            {Object.values(ShiftType).map((type) => {
              return (
                <tr key={type}>
                  <ShiftTypeCell
                    isEditMode={isEditMode}
                    shiftType={type}
                    line={line}
                    setLineWithProcess={setLineWithProcess}
                    setSaveProgress={setSaveProgress}
                  />
                  <td className="flex bg-gray-50">
                    {line.processes.map((process) => {
                      return (
                        <ContainerWaitingWorker
                          data={data}
                          isEditMode={isEditMode}
                          isLocked={isLocked}
                          key={process.id}
                          process={process}
                          shiftType={type}
                          setLineWithProcess={setLineWithProcess}
                          onDragStart={(e, processId, shiftType) =>
                            workerDropControl.handleDragStart(
                              e,
                              { processId, shiftType },
                              'worker',
                              line.id,
                              processId,
                            )
                          }
                          onDrop={(e, processId, shiftType) =>
                            workerDropControl.handleDrop(
                              e,
                              { processId, shiftType },
                              'worker',
                              line.id,
                              processId,
                            )
                          }
                          onDragOver={workerDropControl.handleDragOver}
                          onDragEnd={workerDropControl.handleDragEnd}
                          isDragging={workerDropControl.isDragging}
                          dragState={workerDropControl.dragState}
                        />
                      )
                    })}
                  </td>
                </tr>
              )
            })}
          </React.Fragment>
        )
      })}
      {/* 라인 추가 */}
      {isEditMode && <ButtonAddLine onClick={editLineControl.handleAddLine} />}
    </tbody>
  )
}

export default LineRow
