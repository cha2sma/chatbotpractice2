import './App.css'
import Chatbot from './components/Chatbot'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>English Quiz App</h1>
        <p>GPT와 함께하는 즐거운 영어 단어 학습</p>
      </header>
      <main>
        <Chatbot />
      </main>
      <footer className="app-footer">
        <p>&copy; 2026 English Quiz Chatbot. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
