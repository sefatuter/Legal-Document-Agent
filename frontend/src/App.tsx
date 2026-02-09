import { URLInput } from './components/URLInput'
import { PDFViewer } from './components/PDFViewer'
import { ChatInterface } from './components/ChatInterface'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Legal Document Agent</h1>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3">
          <URLInput />
        </div>

        <div className="lg:col-span-2 h-[600px]">
          <PDFViewer />
        </div>

        <div className="lg:col-span-1 h-[600px]">
          <ChatInterface />
        </div>
      </main>
    </div>
  )
}

export default App
