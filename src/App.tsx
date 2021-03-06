import React from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { useCollectionsStore } from "./stores"
import { TodoList } from "./TodoList"
const { ipcRenderer: ipc } = window.require("electron")

function App() {
  useHotkeys("cmd+'", () => {
    ipc.invoke("reset-collections").then(collections => {
      useCollectionsStore.setState({ collections })
    })
  })

  return (
    <div>
      <TodoList />
    </div>
  )
}

export default App
