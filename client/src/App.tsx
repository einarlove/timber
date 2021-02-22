import React from "react"

function App() {
  const [todos, setTodos] = React.useState<string[]>([])
  return (
    <div>
      <header className="header">Timber</header>
      {todos.map((todo) => (
        <div key={todo}>{todo}</div>
      ))}
      <input
        placeholder="Todo"
        onKeyPress={(event) => {
          const input = event.currentTarget
          const value = input.value
          if (event.key === "Enter") {
            setTodos((todos) => [...todos, value])
            input.value = ""
          }
        }}
      />
    </div>
  )
}

export default App
