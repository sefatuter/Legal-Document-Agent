import { useState } from 'react';
import { URLInput } from './components/URLInput';
import { ChatInterface } from './components/ChatInterface';
import { Scale } from 'lucide-react';

function App() {
  const [hasDocument, setHasDocument] = useState(false);

  const handleDocumentSuccess = () => {
    setHasDocument(true);
  };

  const handleReset = () => {
    setHasDocument(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Scale className="w-6 h-6 text-blue-600 mr-2" />
          <h1 className="text-xl font-bold text-gray-900">Legal Document Agent</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl">
          {!hasDocument ? (
            <URLInput onSuccess={handleDocumentSuccess} />
          ) : (
            <div className="animate-fade-in-up">
              <ChatInterface onReset={handleReset} />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        Powered by Gemini 2.5 Flash Lite & ChromaDB
      </footer>
    </div>
  )
}

export default App
