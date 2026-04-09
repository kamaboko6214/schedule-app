"use client"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import Calendar from "./calender"
import ScheduleView from "./ScheduleView"
import AddModal from "./addmodal"
import ConfirmDialog from "./ConfirmDialog"
import { createClient } from "../../../utils/supabase/client"
import { useRouter } from "next/navigation"
import Todo from "./todo"

const toLocalDateStr = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

const Page = () => {
  const supabase = createClient()
  const router = useRouter()

  // ----------------------
  // State
  // ----------------------
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [schedules, setSchedules] = useState<any[]>([])
  const [editingSchedule, setEditingSchedule] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    startTime: "",
    endTime: "",
    description: "",
  })
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"save" | "delete" | "deleteTodo" | null>(null)
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null)
  const [scheduledDates, setScheduledDates] = useState<Set<string>>(new Set())
  const [todos, setTodos] = useState<
    { id: string; title: string; is_completed: boolean }[]
  >([])
  const [userId, setUserId] = useState<string | null>(null)

  // ----------------------
  // ユーザーID取得
  // ----------------------
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
    })
  }, [])

  // ----------------------
  // データ取得
  // ----------------------
  const fetchSchedules = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("date", toLocalDateStr(currentDate))
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
      if (error) {
        console.error("Error fetching schedules:", error)
        toast.error(`スケジュールの取得に失敗しました: ${error.message}`)
      } else {
        setSchedules(data || [])
      }
    } catch (error) {
      console.error("Unexpected error:", error)
    }
  }

  const fetchMonthSchedules = async (uid: string) => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = toLocalDateStr(new Date(year, month, 1))
    const lastDay = toLocalDateStr(new Date(year, month + 1, 0))
    const { data } = await supabase
      .from("schedules")
      .select("date")
      .eq("user_id", uid)
      .gte("date", firstDay)
      .lte("date", lastDay)
    if (data) {
      setScheduledDates(new Set(data.map((s: any) => s.date)))
    }
  }

  const fetchTodos = async (uid: string) => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: true })
    if (error) {
      console.error("Error fetching todos:", error)
    } else {
      setTodos(data || [])
    }
  }

  // ----------------------
  // useEffect
  // ----------------------
  useEffect(() => {
    if (userId) fetchSchedules(userId)
  }, [currentDate, userId])

  useEffect(() => {
    if (userId) fetchMonthSchedules(userId)
  }, [currentDate.getFullYear(), currentDate.getMonth(), userId])

  useEffect(() => {
    if (userId) fetchTodos(userId)
  }, [userId])

  // currentDateが変更されたらlocalStorageに保存
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentDate", currentDate.toISOString())
    }
  }, [currentDate])

  // ----------------------
  // モーダル
  // ----------------------
  const handleAddSchedule = () => {
    setIsModalOpen(true)
  }

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

  // ----------------------
  // スケジュール CRUD
  // ----------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setConfirmAction("save")
    setIsConfirmDialogOpen(true)
  }

  const saveSchedule = async () => {
    if (!userId) return
    try {
      if (editingSchedule) {
        // 編集の場合
        const { data, error } = await supabase
          .from("schedules")
          .update({
            title: formData.title,
            start_time: formData.startTime,
            end_time: formData.endTime,
            description: formData.description,
          })
          .eq("id", editingSchedule.id)
          .eq("user_id", userId)
          .select()

        if (error) {
          console.error("Error updating schedule:", error)
          toast.error(`予定の更新に失敗しました: ${error.message}`)
        } else {
          console.log("Schedule updated successfully:", data)
          toast.success("予定を更新しました！")
          handleCloseModal()
          fetchSchedules(userId)
          fetchMonthSchedules(userId)
        }
      } else {
        // 新規作成の場合
        const { data, error } = await supabase
          .from("schedules")
          .insert([
            {
              user_id: userId,
              title: formData.title,
              start_time: formData.startTime,
              end_time: formData.endTime,
              description: formData.description,
              date: toLocalDateStr(currentDate),
            },
          ])
          .select()

        if (error) {
          console.error("Error inserting schedule:", error)
          toast.error(`予定の保存に失敗しました: ${error.message}`)
        } else {
          console.log("Schedule saved successfully:", data)
          toast.success("予定を保存しました！")
          handleCloseModal()
          fetchSchedules(userId)
          fetchMonthSchedules(userId)
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("予期しないエラーが発生しました")
    }
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

  const handleDeleteSchedule = async () => {
    if (!editingSchedule) return
    setConfirmAction("delete")
    setIsConfirmDialogOpen(true)
  }

  const deleteSchedule = async () => {
    try {
      const { error } = await supabase
        .from("schedules")
        .delete()
        .eq("id", editingSchedule.id)

      if (error) {
        console.error("Error deleting schedule:", error)
        toast.error(`予定の削除に失敗しました: ${error.message}`)
      } else {
        console.log("Schedule deleted successfully")
        toast.success("予定を削除しました！")
        handleCloseModal()
        if (userId) fetchSchedules(userId)
        if (userId) fetchMonthSchedules(userId)
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("予期しないエラーが発生しました")
    }
  }

  // ----------------------
  // Todo CRUD
  // ----------------------
  const saveTodo = async (todo: string) => {
    if (!userId) return
    const { error } = await supabase
      .from("todos")
      .insert([{ title: todo, is_completed: false, user_id: userId }])
    if (error) {
      toast.error(`Todoの保存に失敗しました: ${error.message}`)
    } else {
      toast.success("Todoを保存しました！")
      fetchTodos(userId)
    }
  }

  const completeTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return
    const { error } = await supabase
      .from("todos")
      .update({ is_completed: !todo.is_completed })
      .eq("id", id)
    if (error) {
      toast.error(`Todoの更新に失敗しました: ${error.message}`)
    } else {
      if (userId) fetchTodos(userId)
    }
  }

  const handleDeleteTodo = async (id: string) => {
    setDeletingTodoId(id)
    setConfirmAction("deleteTodo")
    setIsConfirmDialogOpen(true)
  }

  // ----------------------
  // 確認ダイアログ
  // ----------------------
  const onConfirmAction = async () => {
    if (confirmAction === "save") {
      await saveSchedule()
    } else if (confirmAction === "delete") {
      await deleteSchedule()
    } else if (confirmAction === "deleteTodo" && deletingTodoId) {
      const { error } = await supabase.from("todos").delete().eq("id", deletingTodoId)
      if (error) {
        toast.error(`Todoの削除に失敗しました: ${error.message}`)
      } else {
        toast.success("Todoを削除しました！")
        if (userId) fetchTodos(userId)
      }
    }
    setIsConfirmDialogOpen(false)
    setConfirmAction(null)
    setDeletingTodoId(null)
  }

  const onCancelAction = () => {
    setIsConfirmDialogOpen(false)
    setConfirmAction(null)
    setDeletingTodoId(null)
  }

  // ----------------------
  // Render
  // ----------------------
  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-2 md:p-4 border-b border-slate-200 bg-slate-50">
        <h1 className="ml-2 text-xl text-gray-700 md:text-2xl font-bold ">
          スケジュールアプリ
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = "/login"
            }}
            className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg px-3 py-1.5 transition"
          >
            ログアウト
          </button>
          <button
            onClick={handleAddSchedule}
            className="cursor-pointer bg-sky-600 shadow-lg shadow-sky-500/10 hover:bg-sky-700 text-white rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-xl md:text-2xl font-semibold transition"
          >
            +
          </button>
        </div>
      </div>
      <div className="flex flex-col md:grid md:grid-cols-[300px_1fr] flex-1 overflow-hidden">
        <div className="flex flex-col">
          <Calendar
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            scheduledDates={scheduledDates}
          />
          <Todo
            todos={todos}
            saveTodo={saveTodo}
            completeTodo={completeTodo}
            handleDeleteTodo={handleDeleteTodo}
          />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScheduleView
            schedules={schedules}
            setIsModalOpen={setIsModalOpen}
            onEditSchedule={onEditSchedule}
          />
        </div>
      </div>
      {isModalOpen && (
        <AddModal
          formData={formData}
          setFormData={setFormData}
          handleCloseModal={handleCloseModal}
          handleSubmit={handleSubmit}
          editingSchedule={editingSchedule}
          handleDeleteSchedule={handleDeleteSchedule}
        />
      )}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title={
          confirmAction === "delete" ? "予定を削除しますか？"
          : confirmAction === "deleteTodo" ? "Todoを削除しますか？"
          : "この内容で保存しますか？"
        }
        message={
          confirmAction === "delete" || confirmAction === "deleteTodo"
            ? "この操作は取り消せません。"
            : "予定を保存します。よろしいですか？"
        }
        onConfirm={onConfirmAction}
        onCancel={onCancelAction}
        confirmText={confirmAction === "save" ? "保存する" : "削除する"}
        isDangerous={confirmAction === "delete" || confirmAction === "deleteTodo"}
      />
    </div>
  )
}

export default Page
