import { useState } from 'react';
import { runAgentStream, type ChatResponse } from '../api/client';
import ReactMarkdown from 'react-markdown';
import { Loader2, ArrowRight, RefreshCw } from 'lucide-react';

interface ChatInterfaceProps {
    onReset: () => void;
}

export const ChatInterface = ({ onReset }: ChatInterfaceProps) => {
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ChatResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question) return;

        setLoading(true);
        setError(null);
        // Reset result but keep citations empty initially
        setResult({ answer: '', citations: [] });

        await runAgentStream(
            question,
            (chunk) => {
                setResult((prev) => ({
                    answer: (prev?.answer || '') + chunk,
                    citations: prev?.citations || []
                }));
            },
            () => setLoading(false),
            (err) => {
                setError(err);
                setLoading(false);
            }
        );
    };

    if (result) {
        return (
            <div className="w-full max-w-2xl mx-auto space-y-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Analysis Result</h3>
                        <button
                            onClick={() => setResult(null)}
                            className="text-gray-500 hover:text-blue-600 text-sm font-medium"
                        >
                            Ask Another Question
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="prose prose-blue max-w-none text-gray-800 leading-relaxed mb-6">
                            <ReactMarkdown>{result.answer}</ReactMarkdown>
                        </div>

                        {result.citations && result.citations.length > 0 && (
                            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-900">
                                <p className="font-semibold mb-2">Sources:</p>
                                <div className="space-y-2">
                                    {result.citations.map((cite, i) => (
                                        <div key={i} className="flex gap-2">
                                            <span className="font-mono text-xs bg-blue-100 px-1 py-0.5 rounded h-fit">p.{cite.page_number}</span>
                                            <span className="italic opacity-80">"...{cite.text_snippet}..."</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={onReset}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Process New Document
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">What would you like to know?</h2>
                <p className="text-gray-600 mt-2">Ask specifically about clauses, dates, or obligations.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g. What are the termination conditions?"
                        className="w-full pl-4 pr-12 py-4 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg transition-all"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !question}
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                    </button>
                </div>
                {error && (
                    <div className="text-center text-red-600 text-sm mt-2">{error}</div>
                )}
            </form>
        </div>
    );
};
