import React from "react"
import { useTodoStore } from "./stores"
import { Collection } from "./Collection"

type TodoListProps = {
  [key: string]: unknown
}

export function TodoList(props: TodoListProps) {
  const { collections } = useTodoStore()
  return (
    <div className="todo-list">
      {Object.values(collections).map(collection => (
        <Collection collectionKey={collection.key} key={collection.key} />
      ))}
      {/* <pre>{JSON.stringify(collections, null, 2)}</pre> */}
    </div>
  )
}
