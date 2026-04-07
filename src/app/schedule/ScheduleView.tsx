"use client"

type Schedule = {
  id: string
  title: string
  start_time: string
  end_time: string
  description: string
  created_at: string
}

type ScheduleViewProps = {
  schedules: Schedule[]
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  onEditSchedule: (schedule: Schedule) => void
}

const ScheduleView = ({ schedules, setIsModalOpen, onEditSchedule }: ScheduleViewProps) => {
    // スケジュールがある時間帯を計算
    const getTimeRange = () => {
      if (schedules.length === 0) {
        return { startHour: 0, endHour: 24 } // スケジュールがない場合は24時間表示
      }

      let minHour = 24
      let maxHour = 0

      schedules.forEach(schedule => {
        const [startHour] = schedule.start_time.split(':').map(Number)
        const [endHour] = schedule.end_time.split(':').map(Number)

        minHour = Math.min(minHour, startHour)
        maxHour = Math.max(maxHour, endHour)
      })

      // 余裕を持たせる（最小1時間前、最大2時間後）
      const startHour = Math.max(0, minHour - 1)
      const endHour = Math.min(24, maxHour + 2)

      return { startHour, endHour }
    }
    const { startHour, endHour } = getTimeRange()
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, index) => startHour + index)

    // スケジュールを時間軸上に配置するための計算
    const getSchedulePosition = (startTime: string, endTime: string) => {
      const [startHour, startMinute] = startTime.split(':').map(Number)
      const [endHour, endMinute] = endTime.split(':').map(Number)

      const startTotalMinutes = startHour * 60 + startMinute
      const endTotalMinutes = endHour * 60 + endMinute

      // startHourからの相対位置を計算
      const relativeStartMinutes = startTotalMinutes - (startHour * 60)
      const top = (relativeStartMinutes / 60) * 48
      const height = ((endTotalMinutes - startTotalMinutes) / 60) * 48

      return { top, height }
    }

    return (
      <div className="flex flex-col items-center h-full overflow-y-auto">
        <div className="grid grid-cols-[200px_1fr] gap-4 w-full min-h-full p-4 relative">
            <div className="text-sm text-gray-500 grid p-2 border-l border-gray-200">
                {hours.map((hour) => (
                    <div key={hour} className="h-12">
                        {hour}:00
                    </div>
                ))}
            </div>
            <div className="text-center text-sm text-gray-500 grid p-2 border-b border-gray-200 relative min-h-full">
                {hours.map((hour) => (
                    <div key={hour} className="h-12 border-b border-gray-200">
                    </div>
                ))}

                {/* スケジュールの表示 */}
                {schedules.map((schedule) => {
                  const [scheduleStartHour] = schedule.start_time.split(':').map(Number)
                  const hourIndex = scheduleStartHour - startHour
                  const baseTop = hourIndex * 48 // 各時間のベース位置
                  const { top: relativeTop, height } = getSchedulePosition(schedule.start_time, schedule.end_time)

                  return (
                    <div
                      key={schedule.id}
                      className="absolute left-2 right-2 bg-sky-100 border border-sky-200 rounded-lg p-2 shadow-sm cursor-pointer hover:bg-sky-200 transition-colors"
                      style={{
                        top: `${baseTop + relativeTop}px`,
                        height: `${Math.max(height, 24)}px`, // 最小高さを24pxに設定
                      }}
                      onClick={() => onEditSchedule(schedule)}
                    >
                      <div className="font-semibold text-sky-900 text-sm truncate cursor-pointer" onClick={() => setIsModalOpen(true)}>
                        {schedule.title}
                      </div>
                      <div className="text-xs text-sky-700">
                        {schedule.start_time} - {schedule.end_time}
                      </div>
                      {schedule.description && (
                        <div className="text-xs text-sky-600 truncate mt-1">
                          {schedule.description}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
        </div>
      </div>
  )
}

export default ScheduleView
