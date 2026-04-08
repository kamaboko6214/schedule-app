"use client"

import { useState } from "react"
type CalendarProps = {
  currentDate: Date
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>
  scheduledDates?: Set<string>
}

const Calendar = (props: CalendarProps) => {
  const { scheduledDates } = props
  const date = props.currentDate
  const year: number = date.getFullYear()
  const month: number = date.getMonth()
  const firstDay: number = new Date(year, month, 1).getDay()
  const editDate = `${year}年${month + 1}月`
  const daysInMonth: number = new Date(year, month + 1, 0).getDate()
  const today = new Date()
//   日付の配列
  const days: number[] = Array.from(
    { length: daysInMonth },
    (_, index) => index + 1,
  )
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const setDate = (e: React.MouseEvent<HTMLDivElement>) => {
    const selectedDay = parseInt(e.currentTarget.dataset.day || "1", 10)
    props.setCurrentDate(new Date(year, month, selectedDay))
  }
  const handlePrevMonth = () => {
    props.setCurrentDate(new Date(year, month - 1, 1))
  }
  const handleNextMonth = () => {
    props.setCurrentDate(new Date(year, month + 1, 1))
  }
  return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between text-sm m-2 md:m-3">
          <span className="hover:bg-gray-100 rounded-lg px-2 py-1 cursor-pointer text-sm md:text-base" onClick={handlePrevMonth}>＜</span>
          <span className="text-base md:text-lg font-medium">{editDate}</span>
          <span className="hover:bg-gray-100 rounded-lg px-2 py-1 cursor-pointer text-sm md:text-base" onClick={handleNextMonth}>＞</span>
        </div>
        <div className="h-48 md:h-64 grid grid-cols-7">
          {daysOfWeek.map((day, index) => {
            return (
              <div
                key={index}
                className="text-center text-sm text-gray-500 grid p-2"
              >
                {day}
              </div>
            )
          })}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day, index) => {
            const isSelect = date.getDate() === day
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const hasSchedule = scheduledDates?.has(dateStr)
            return (
              <div
                key={index}
                data-day={day}
                className={`cursor-pointer text-center text-sm flex flex-col items-center justify-center p-1 rounded-full ${isSelect ? "bg-blue-100 font-bold hover:bg-blue-200" : "text-gray-500 hover:bg-gray-100"} ${isToday ? "border border-blue-600" : ""}`}
                onClick={setDate}
              >
                <span>{day}</span>
                {hasSchedule && <div className="w-1 h-1 rounded-full bg-sky-500 mt-0.5" />}
              </div>
            )
          })}
        </div>
      </div>
  )
}

export default Calendar
