import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="text-amber-600">Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div className="flex justify-center gap-2 mt-4">
        <div className="flex flex-col border-2 border-dashed items-center gap-6 p-7 md:flex-row md:gap-8 rounded-2xl">
          <div>
            <img className="size-48 shadow-xl rounded-md" alt="" src="https://images.unsplash.com/photo-1765527219001-2810d2689423?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <span className="text-2xl font-medium">Warfare</span>
            <span className="font-medium text-sky-500">The Anti-Patterns</span>
            <span className="flex gap-2 font-medium text-gray-600 dark:text-gray-400">
              <span>No. 4</span>
              <span>·</span>
              <span>2025</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col border-2 border-dashed items-center gap-6 p-7 md:flex-row md:gap-8 rounded-2xl">
          <div>
            <img className="size-48 shadow-xl rounded-md" alt="" src="https://images.unsplash.com/photo-1765527219001-2810d2689423?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
          </div>
          <div className="flex flex-col items-center md:items-start">
            <span className="text-2xl font-medium">Warfare</span>
            <span className="font-medium text-sky-500">The Anti-Patterns</span>
            <span className="flex gap-2 font-medium text-gray-600 dark:text-gray-400">
              <span>No. 4</span>
              <span>·</span>
              <span>2025</span>
            </span>
          </div>
        </div>
      </div>

    </>
  )
}

export default App
