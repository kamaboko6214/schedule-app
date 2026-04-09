"use client"

import { useState } from "react"

type Todo = {
  id: string
  title: string
  is_completed: boolean
}

type TodoProps = {
  todos: Todo[]
  saveTodo: (todo: string) => Promise<void>
  completeTodo: (id: string) => Promise<void>
  handleDeleteTodo: (id: string) => Promise<void>
}

const Todo = ({ todos, saveTodo, completeTodo, handleDeleteTodo }: TodoProps) => {
  const [newTodo, setNewTodo] = useState("")

  const handleAddTodo = async () => {
    if (newTodo.trim() === "") return
    await saveTodo(newTodo.trim())
    setNewTodo("")
  }

  return (
    <div>
      <div className="border-t border-gray-300 flex flex-col p-4 text-gray-700 shadow-sm mt-4">
        <h1 className="text-xl font-bold">Todoリスト</h1>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="新しいTodoを入力"
          required
          className="text-sm mt-5 w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          onClick={handleAddTodo}
          className="text-sm cursor-pointer self-end bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-full transition"
        >
          追加
        </button>
      </div>
      <div className="mt-4 w-full">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between shadow-md p-2 rounded mb-2"
          >
            <input
              type="checkbox"
              className="mr-2 cursor-pointer w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-sky-500"
              checked={todo.is_completed}
              onChange={() => completeTodo(todo.id)}
            />
            <span className={todo.is_completed ? "line-through text-gray-400" : ""}>{todo.title}</span>
            <button
              onClick={() => handleDeleteTodo(todo.id)}
              className="text-red-500 hover:text-red-700 transition cursor-pointer text-sm"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Todo
