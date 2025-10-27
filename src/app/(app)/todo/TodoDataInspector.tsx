import { useState, useEffect } from 'react';
import { useAuth } from "@/global/auth/useAuth";
import { Button } from '@/components/ui/button';
import { Copy, Briefcase, User, Layers } from 'lucide-react';
import { Todo, categoryIcons, formatDate } from './TodoData';
import {cn} from "@/lib/utils";

interface TodoResponse {
    todos: Todo[];
    count: number;
}

export function TodoDataInspector() {
    const { token, user, API_URL } = useAuth();
    const [todoData, setTodoData] = useState<TodoResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState<number>(0);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(
            () => alert('Error copied to clipboard!'),
            (err) => alert(`Failed to copy error: ${err.message}`)
        );
    };

    const fetchData = async () => {
        if (!token || !user?.tenantId) {
            setError('No authentication token or tenant ID available. Please log in.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/todos`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-tenant-id': `${user.tenantId}`,
                    'x-user-id': `${user.id}`,
                },
            });

            if (response.ok) {
                const jsonData: TodoResponse = await response.json();
                // Normalize `completed` field to boolean and handle invalid categories
                const normalizedTodos = jsonData.todos.map((todo) => ({
                    ...todo,
                    completed: !!todo.completed, // Convert 0/1 to boolean
                    category: ['Work', 'Personal', 'Other'].includes(todo.category) ? todo.category : 'Other', // Fallback to 'Other'
                }));
                setTodoData({ ...jsonData, todos: normalizedTodos });
                setError(null);
            } else {
                const errorText = await response.text();
                setError(`Failed to fetch todos: ${response.status} ${response.statusText} - ${errorText}`);
            }
        } catch (err) {
            setError(`Network error: ${err.message}. Is the server running at ${API_URL}?`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token, retryCount, user?.tenantId]);

    const renderTodoItem = (todo: Todo) => {
        const CategoryIcon = categoryIcons[todo.category] || Layers;
        return (
            <div
                key={todo.id}
                className={cn(
                    'flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm mb-2',
                    todo.completed && 'opacity-75'
                )}
            >
                <span className="w-8 text-gray-500 font-medium">{todo.id}.</span>
                <div className="flex-1 flex items-center gap-2">
          <span
              className={cn(
                  'flex-1 flex items-center gap-2',
                  todo.completed && 'line-through text-gray-500'
              )}
          >
            {todo.text}{' '}
              <span className="text-sm text-gray-400 flex items-center gap-1">
              <CategoryIcon className="w-4 h-4" />
                  {todo.category}
            </span>
          </span>
                    <div className="flex items-center gap-2 border-l border-gray-300 pl-2">
            <span className={cn('text-sm', todo.completed ? 'text-gray-500' : 'text-gray-600')}>
              {formatDate(todo.due_date)}
            </span>
                        <span
                            className={cn(
                                'text-sm capitalize',
                                todo.priority === 'low' && 'text-green-600',
                                todo.priority === 'medium' && 'text-yellow-600',
                                todo.priority === 'high' && 'text-red-600',
                                todo.completed && 'text-gray-500'
                            )}
                        >
              {todo.priority}
            </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center space-y-8 p-6 bg-gray-100 rounded-lg shadow-lg w-full max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl">
                <h1 className="text-xl font-semibold mb-4 text-center">Todo Data from /api/todos</h1>
                {loading ? (
                    <p className="text-gray-600 text-center">Loading...</p>
                ) : error ? (
                    <div className="flex flex-col items-start gap-2">
                        <div className="flex items-center gap-2">
                            <p className="text-red-600 text-sm">{error}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(error)}
                                title="Copy error to clipboard"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="mt-4 text-sm text-gray-600 pl-5">
                            <ul className="list-disc space-y-2 pl-5">
                                <li>Ensure the backend server is running at {API_URL} with todo routes registered.</li>
                                <li>Add todo routes to Express: app.use('/api/todos', createTodoRouter(dbAdapter)).</li>
                                <li>Test with curl: curl -H "Authorization: Bearer &lt;token&gt;" {API_URL}/api/todos</li>
                                <li>Check backend logs for missing route errors.</li>
                            </ul>
                        </div>
                    </div>
                ) : todoData && todoData.todos.length > 0 ? (
                    <div className="space-y-2">
                        {todoData.todos.map(renderTodoItem)}
                        <p className="text-sm text-gray-600 mt-4">Total todos: {todoData.count}</p>
                    </div>
                ) : (
                    <p className="text-gray-600 text-center">No todos available.</p>
                )}
            </div>

            <Button
                onClick={() => setRetryCount((prev) => prev + 1)}
                className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2"
            >
                Retry Fetch
            </Button>
        </div>
    );
}