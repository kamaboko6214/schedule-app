type AddModalProps = {
  formData: {
    title: string 
    startTime: string
    endTime: string
    description: string
  }
  setFormData: React.Dispatch<React.SetStateAction<{
    title: string
    startTime: string
    endTime: string
    description: string
  }>>
  handleCloseModal: () => void
  handleSubmit: (e: React.FormEvent) => void
  editingSchedule?: {
    id: string
    title: string
    start_time: string
    end_time: string
    description: string
  } | null
  handleDeleteSchedule?: () => void
}

const AddModal = (props: AddModalProps) => {
  const { formData, setFormData, handleCloseModal, handleSubmit, editingSchedule, handleDeleteSchedule } = props
  return (
        <div className="fixed inset-0 bg-[rgba(15,23,42,0.45)] flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="w-full max-w-sm md:max-w-md rounded-[20px] md:rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] p-4 md:p-7">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center rounded-full bg-sky-100 text-sky-700 w-11 h-11 mb-3">
                <span className="text-xl font-semibold">＋</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">
                {editingSchedule ? '予定を編集' : '予定を追加'}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {editingSchedule ? '予定の内容を変更してください。' : '必要な項目を入力して、予定を保存してください。'}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">タイトル</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="予定のタイトル"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">開始時間</label>
                  <input
                    type="time"
                    step="300"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">終了時間</label>
                  <input
                    type="time"
                    
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">内容</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="説明（オプション）"
                  rows={4}
                />
              </div>
              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                {editingSchedule && (
                  <button
                    type="button"
                    onClick={handleDeleteSchedule}
                    className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                  >
                    削除する
                  </button>
                )}
                <div className="flex flex-col gap-3 flex-1 sm:flex-row">
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
                  >
                    {editingSchedule ? '更新する' : '保存する'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
    )
}

export default AddModal