export const ChatInterface = () => {
    return (
        <div className="p-4 bg-gray-100 rounded-lg h-full">
            <h2 className="text-xl font-bold mb-2">Chat Interface</h2>
            <div className="bg-white h-64 border rounded p-4 mb-4">
                Chat messages...
            </div>
            <input type="text" placeholder="Ask a question..." className="border p-2 w-full rounded" />
        </div>
    );
};
