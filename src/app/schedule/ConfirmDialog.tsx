type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '確認',
  cancelText = 'キャンセル',
  isDangerous = false,
}: ConfirmDialogProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[rgba(15,23,42,0.45)] flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[20px] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
