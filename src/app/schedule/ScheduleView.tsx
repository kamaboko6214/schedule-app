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

const HOUR_HEIGHT = 64
const DEFAULT_START = 6
const DEFAULT_END = 22

const ScheduleView = ({
  schedules,
  setIsModalOpen,
  onEditSchedule,
}: ScheduleViewProps) => {
  const scheduleContainerRef = useRef<HTMLDivElement>(null)

  // スケジュールの時間に合わせて表示範囲を動的に決定
  const getTimeRange = () => {
    if (schedules.length === 0) return { startHour: DEFAULT_START, endHour: DEFAULT_END }
    const allHours = schedules.flatMap((s) => [
      parseInt(s.start_time.split(":")[0]),
      Math.ceil(parseInt(s.end_time.split(":")[0]) + parseInt(s.end_time.split(":")[1]) / 60),
    ])
    return {
      startHour: Math.min(DEFAULT_START, ...allHours),
      endHour: Math.max(DEFAULT_END, ...allHours),
    }
  }

  const { startHour, endHour } = getTimeRange()
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)

  // スケジュールを時間軸上に配置するための計算
  const getSchedulePosition = (startTime: string, endTime: string) => {
    const [sH, sM] = startTime.split(":").map(Number)
    const [eH, eM] = endTime.split(":").map(Number)
    const top = ((sH - startHour) * 60 + sM) / 60 * HOUR_HEIGHT
    const height = ((eH * 60 + eM) - (sH * 60 + sM)) / 60 * HOUR_HEIGHT
    return { top, height }
  }

  // スケジュールがある時間帯に自動スクロール
  useEffect(() => {
    if (schedules.length > 0) {
      const firstSchedule = schedules[0]
      const { top } = getSchedulePosition(firstSchedule.start_time, firstSchedule.end_time)
      scheduleContainerRef.current?.scrollTo({ top: top - HOUR_HEIGHT, behavior: "smooth" })
    } else {
      scheduleContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [schedules])

  return (
    <div className="flex h-full overflow-y-auto" ref={scheduleContainerRef}>
      {/* 時間軸 */}
      <div
        className="relative flex-shrink-0 w-14"
        style={{ height: `${hours.length * HOUR_HEIGHT}px` }}
      >
        {hours.map((hour) => (
          <div
            key={hour}
            className="absolute w-full text-right pr-3 text-xs text-gray-400 leading-none"
            style={{ top: `${(hour - startHour) * HOUR_HEIGHT}px` }}
          >
            {hour}:00
          </div>
        ))}
      </div>

      {/* スケジュールエリア */}
      <div
        className="relative flex-1 border-l border-gray-200"
        style={{ height: `${hours.length * HOUR_HEIGHT}px` }}
      >
        {/* 時間の区切り線 */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="border-b border-gray-100"
            style={{ height: `${HOUR_HEIGHT}px` }}
          />
        ))}

        {/* 予定なし */}
        {schedules.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-gray-300">この日の予定はありません</p>
          </div>
        )}

        {/* スケジュールの表示 */}
        {schedules.map((schedule) => {
          const { top, height } = getSchedulePosition(schedule.start_time, schedule.end_time)
          return (
            <div
              key={schedule.id}
              className="absolute left-1 right-1 bg-sky-100 border border-sky-200 rounded-lg px-2 py-1 shadow-sm cursor-pointer hover:bg-sky-200 transition-colors overflow-hidden"
              style={{ top: `${top}px`, height: `${Math.max(height, 28)}px` }}
              onClick={() => onEditSchedule(schedule)}
            >
              <p className="font-semibold text-sky-900 text-xs leading-tight truncate">
                {schedule.title}
              </p>
              <p className="text-sky-600 text-xs leading-tight">
                {schedule.start_time} 〜 {schedule.end_time}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ScheduleView
