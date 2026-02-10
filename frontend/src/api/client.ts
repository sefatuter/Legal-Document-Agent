import axios from 'axios';

// Create axios instance with base URL
// In production, this should be an env var. For dev in Vite, we can use the proxy or direct URL.
// Assuming proxy is set up or CORS allows localhost:8000
const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface DocumentResponse {
    message: string;
    document_id: string;
}

export interface Citation {
    source: string;
    page_number: number;
    text_snippet: string;
}

export interface ChatResponse {
    answer: string;
    citations: Citation[];
}

export const createKnowledgeBase = async (url: string): Promise<DocumentResponse> => {
    const response = await api.post<DocumentResponse>('/create-knowledge-base', { url });
    return response.data;
};

export const runAgent = async (question: string): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/run-agent', { question });
    return response.data;
};

export const runAgentStream = async (
    question: string,
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (error: string) => void
): Promise<void> => {
    try {
        const response = await fetch(`${api.defaults.baseURL}/run-agent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to get response');
        }

        if (!response.body) throw new Error('ReadableStream not supported');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            onChunk(chunk);
        }

        onDone();
    } catch (error: any) {
        onError(error.message || 'Stream error');
    }
};
