"use client"

import { useState, useEffect } from "react"
import Calendar from "./calender"
import ScheduleView from "./ScheduleView"
import AddModal from "./addmodal"
import { createClient } from '../../../utils/supabase/client'
import toast from 'react-hot-toast'

const Page = () => {
  const supabase = createClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [schedules, setSchedules] = useState<any[]>([])
  const [editingSchedule, setEditingSchedule] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    startTime: "",
    endTime: "",
    description: "",
  })

  // スケジュールをSupabaseから取得
  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching schedules:', error)
        toast.error(`スケジュールの取得に失敗しました: ${error.message}`)
      } else {
        setSchedules(data || [])
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    }
  }

  // コンポーネントマウント時にデータを取得
  useEffect(() => {
    fetchSchedules()
  }, [])  
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingSchedule(null)
    setFormData({ 
      title: "",
      startTime: "",
      endTime: "",
      description: "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingSchedule) {
        // 編集の場合
        const { data, error } = await supabase
          .from('schedules')
          .update({
            title: formData.title,
            start_time: formData.startTime,
            end_time: formData.endTime,
            description: formData.description,
          })
          .eq('id', editingSchedule.id)
          .select()

        if (error) {
          console.error('Error updating schedule:', error)
          toast.error(`予定の更新に失敗しました: ${error.message}`)
        } else {
          console.log('Schedule updated successfully:', data)
          toast.success('予定を更新しました！')
          handleCloseModal()
          fetchSchedules()
        }
      } else {
        // 新規作成の場合
        const { data, error } = await supabase
          .from('schedules')
          .insert([
            {
              title: formData.title,
              start_time: formData.startTime,
              end_time: formData.endTime,
              description: formData.description,
              date: currentDate.toISOString().split('T')[0],
            }
          ])
          .select()

        if (error) {
          console.error('Error inserting schedule:', error)
          toast.error(`予定の保存に失敗しました: ${error.message}`)
        } else {
          console.log('Schedule saved successfully:', data)
          toast.success('予定を保存しました！')
          handleCloseModal()
          fetchSchedules()
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('予期しないエラーが発生しました')
    }
  }

  const handleAddSchedule = () => {
    setIsModalOpen(true)
  }

  const onEditSchedule = (schedule: any) => {
    setEditingSchedule(schedule)
    setFormData({
      title: schedule.title,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      description: schedule.description,
    })
    setIsModalOpen(true)
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-end items-center p-4 border-b border-slate-200 bg-slate-50">
        <button
          onClick={handleAddSchedule}
          className="cursor-pointer bg-sky-600 shadow-lg shadow-sky-500/10 hover:bg-sky-700 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-semibold transition"
        >
          +
        </button>
      </div>
      <div className="grid grid-cols-[300px_1fr] flex-1 overflow-hidden">
        <div className="flex flex-col">
          <Calendar currentDate={currentDate} setCurrentDate={setCurrentDate} />
          <div className="flex-1">TODO!!!</div>
        </div>
        <ScheduleView schedules={schedules} setIsModalOpen={setIsModalOpen} onEditSchedule={onEditSchedule} />
      </div>
        {isModalOpen && <AddModal formData={formData} setFormData={setFormData} handleCloseModal={handleCloseModal} handleSubmit={handleSubmit} editingSchedule={editingSchedule} />}
    </div>
  )
}

export default Page
