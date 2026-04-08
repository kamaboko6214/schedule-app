"use client"

import { useEffect, useRef } from "react"

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

const ScheduleView = ({
  schedules,
  setIsModalOpen,
  onEditSchedule,
}: ScheduleViewProps) => {
  const scheduleContainerRef = useRef<HTMLDivElement>(null)
  // 表示する時間帯の範囲
  const getTimeRange = () => {
    return { startHour: 0, endHour: 24 }
  }
  const { startHour, endHour } = getTimeRange()

  // スケジュールがある時間帯に自動でスクロールする
  useEffect(() => {
    if (schedules.length > 0) {
      const firstSchedule = schedules[0]
      const [scheduleStartHour] = firstSchedule.start_time
        .split(":")
        .map(Number)
      const hourIndex = scheduleStartHour - startHour
      const baseTop = hourIndex * 50
      const { top: relativeTop } = getSchedulePosition(
        firstSchedule.start_time,
        firstSchedule.end_time,
      )
      const scrollTop = baseTop + relativeTop
      scheduleContainerRef.current?.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      })
    }
  }, [schedules, startHour])

  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, index) => startHour + index,
  )

  // スケジュールを時間軸上に配置するための計算
  const getSchedulePosition = (startTime: string, endTime: string): { top: number, height: number } => {
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute

    // startHourからの相対位置を計算
    const relativeStartMinutes = startTotalMinutes - startHour * 60
    const top = (relativeStartMinutes / 60) * 50
    const height = ((endTotalMinutes - startTotalMinutes) / 60) * 50

    return { top, height }
  }

  return (
    <div
      className="flex flex-col items-center h-full overflow-y-auto"
      ref={scheduleContainerRef}
    >
      <div className="flex flex-col md:grid md:grid-cols-[200px_1fr] gap-2 md:gap-4 w-full p-2 md:p-4 relative" style={{ minHeight: `${hours.length * 50}px` }}>
        <div className="text-sm text-gray-500 grid p-2 md:block hidden">
          {hours.map((hour) => (
            <div key={hour} className="h-12" style={{ height: "50px" }}>
              {hour}:00
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-500 grid p-2 md:p-4 border-b border-gray-200 relative min-h-full md:block">
          {hours.map((hour) => (
            <div
              key={hour}
              className="border-b border-gray-100"
              style={{ height: "50px" }}
            ></div>
          ))}

          {/* スケジュールの表示 */}
          {schedules.map((schedule) => {
            const [scheduleStartHour] = schedule.start_time
              .split(":")
              .map(Number)
            const hourIndex = scheduleStartHour - startHour
            const baseTop = hourIndex * 50 // 各時間のベース位置
            const { top: relativeTop, height } = getSchedulePosition(schedule.start_time, schedule.end_time)

            return (
              <div
                key={schedule.id}
                className="absolute left-2 right-2 bg-sky-100 m-4 border border-sky-200 rounded-lg p-2 shadow-sm cursor-pointer hover:bg-sky-200 transition-colors flex items-center justify-center"
                style={{
                  top: `${baseTop + relativeTop}px`,
                  height: `${Math.max(height, 24)}px`, // 最小高さを24pxに設定
                }}
                onClick={() => onEditSchedule(schedule)}
              >
                <div
                  className="font-semibold text-sky-900 text-sm truncate cursor-pointer text-center"
                  onClick={() => setIsModalOpen(true)}
                >
                  {schedule.title}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ScheduleView
