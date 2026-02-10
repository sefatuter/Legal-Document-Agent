import { useState } from 'react';
import { createKnowledgeBase } from '../api/client';
import { Loader2, FileText } from 'lucide-react';

interface URLInputProps {
    onSuccess: (documentId: string) => void;
}

export const URLInput = ({ onSuccess }: URLInputProps) => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError(null);

        try {
            const response = await createKnowledgeBase(url);
            onSuccess(response.document_id);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to process document');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-md mx-auto">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Analyze Legal Document</h2>
                <p className="mt-2 text-gray-600">Enter the URL of a PDF to begin analysis</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                    <input
                        type="url"
                        placeholder="https://example.com/contract.pdf"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !url}
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing Document...
                        </>
                    ) : (
                        'Start Analysis'
                    )}
                </button>
            </form>
        </div>
    );
};
