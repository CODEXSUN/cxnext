// File: TodoLogic.tsx
// Description: Logic for managing todos in the React frontend, aligned with backend CRUD operations
import { useState, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { Todo, InteractionState, AddState, categories } from './TodoData';
import { useAuth } from '@/global/auth/useAuth';

// Utility to update todo positions for drag-and-drop ordering.
const updatePositions = (todos: Todo[]): Todo[] => {
    return todos.map((todo, index) => ({
        ...todo,
        position: index + 1,
    }));
};

// Normalize todo data from API response to match frontend Todo interface
const normalizeTodo = (todo: any): Todo => ({
    id: todo.id,
    text: todo.text,
    completed: !!todo.completed, // Convert 0/1 to boolean
    category: categories.includes(todo.category) ? todo.category : 'Other',
    due_date: todo.due_date || null,
    priority: todo.priority,
    user_id: todo.user_id,
    position: todo.position || 0,
    created_at: todo.created_at,
    updated_at: todo.updated_at,
});

export const useTodoLogic = () => {
    const { token, user, API_URL, loading: authLoading, headers } = useAuth();
    const baseUrl = `${API_URL}/api/todos`;
    const refreshUrl = `${API_URL}/api/auth/refresh`;
    const [todos, setTodos] = useState<Todo[]>([]);
    const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [interactionState, setInteractionState] = useState<InteractionState>({
        mode: 'none',
        id: null,
        editText: '',
        editCategory: 'Work',
        editDueDate: '',
        editPriority: 'low',
    });
    const [addState, setAddState] = useState<AddState>({
        addText: '',
        addCategory: 'Work',
        addDueDate: '',
        addPriority: 'low',
    });
    const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
    const [overId, setOverId] = useState<number | null>(null);
    const [todoListKey, setTodoListKey] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Derived state for filtered and paginated todos
    const filteredTodos = todos.filter((todo) => {
        const matchesFilter =
            filter === 'all' ||
            (filter === 'completed' && todo.completed) ||
            (filter === 'active' && !todo.completed);
        const matchesCategory = categoryFilter === 'all' || todo.category === categoryFilter;
        return matchesFilter && matchesCategory;
    });

    const pageCount = Math.ceil(filteredTodos.length / pageSize);
    const paginatedTodos = filteredTodos.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

    // Refresh token if needed
    const refreshToken = async () => {
        try {
            const res = await fetch(refreshUrl, {
                method: 'POST',
                headers: headers(),
            });
            if (res.ok) {
                const data = await res.json();
                return data.token;
            } else {
                setError('Token refresh failed');
                console.error('Token refresh failed:', res.statusText);
                return null;
            }
        } catch (error) {
            setError('Network error during token refresh');
            console.error('Error refreshing token:', error);
            return null;
        }
    };

    // Fetch todos
    useEffect(() => {
        const fetchTodos = async () => {
            if (authLoading || !token || !user?.tenantId || !user?.id) return;

            try {
                let res = await fetch(baseUrl, {
                    headers: headers(),
                });
                if (res.status === 401) {
                    const newToken = await refreshToken();
                    if (!newToken) {
                        setError('Authentication failed');
                        return;
                    }
                    res = await fetch(baseUrl, {
                        headers: headers(),
                    });
                }
                if (res.ok) {
                    const data = await res.json();
                    if (data.status !== 200) {
                        setError(`Failed to fetch todos: ${data.body?.error || 'Unknown error'}`);
                        return;
                    }
                    const normalizedTodos = data.body.map(normalizeTodo);
                    setTodos(normalizedTodos.sort((a: Todo, b: Todo) => (a.position ?? Infinity) - (b.position ?? Infinity)));
                    setError(null);
                } else {
                    setError(`Failed to fetch todos: ${res.statusText}`);
                    console.error('Fetch todos failed:', res.statusText);
                }
            } catch (error) {
                setError('Network error while fetching todos');
                console.error('Error fetching todos:', error);
            }
        };

        fetchTodos();
    }, [authLoading, token, user?.tenantId, user?.id, baseUrl]);

    // Add a new todo
    const addTodo = async () => {
        if (!addState.addText || authLoading || !token || !user?.tenantId || !user?.id) {
            setError('Text is required or user not authenticated');
            return;
        }

        try {
            const todoData = {
                text: addState.addText,
                completed: false,
                category: addState.addCategory,
                due_date: addState.addDueDate || null,
                priority: addState.addPriority,
                position: todos.length + 1,
            };
            let res = await fetch(baseUrl, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify(todoData),
            });
            if (res.status === 401) {
                const newToken = await refreshToken();
                if (!newToken) {
                    setError('Authentication failed');
                    return;
                }
                res = await fetch(baseUrl, {
                    method: 'POST',
                    headers: headers(),
                    body: JSON.stringify(todoData),
                });
            }
            if (res.ok) {
                const data = await res.json();
                if (data.status !== 201) {
                    setError(`Failed to create todo: ${data.body?.error || 'Unknown error'}`);
                    return;
                }
                const newTodo = normalizeTodo(data.body);
                setTodos((prev) => [...prev, newTodo].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)));
                setAddState({
                    addText: '',
                    addCategory: 'Work',
                    addDueDate: '',
                    addPriority: 'low',
                });
                setError(null);
            } else {
                setError(`Failed to create todo: ${res.statusText}`);
                console.error('Create todo failed:', res.statusText);
            }
        } catch (error) {
            setError('Network error while creating todo');
            console.error('Error creating todo:', error);
        }
    };

    // Toggle todo completion status
    const toggleTodo = async (id: number) => {
        const todo = todos.find((t) => t.id === id);
        if (!todo || authLoading || !token || !user?.tenantId || !user?.id) {
            setError('Todo not found or user not authenticated');
            return;
        }

        try {
            let res = await fetch(`${baseUrl}/${id}`, {
                method: 'PUT',
                headers: headers(),
                body: JSON.stringify({ completed: !todo.completed }),
            });
            if (res.status === 401) {
                const newToken = await refreshToken();
                if (!newToken) {
                    setError('Authentication failed');
                    return;
                }
                res = await fetch(`${baseUrl}/${id}`, {
                    method: 'PUT',
                    headers: headers(),
                    body: JSON.stringify({ completed: !todo.completed }),
                });
            }
            if (res.ok) {
                const data = await res.json();
                if (data.status !== 200) {
                    setError(`Failed to update todo: ${data.body?.error || 'Unknown error'}`);
                    return;
                }
                const normalizedData = normalizeTodo(data.body);
                setTodos((prev) =>
                    prev.map((t) => (t.id === id ? normalizedData : t))
                );
                setError(null);
            } else {
                setError(`Failed to update todo: ${res.statusText}`);
                console.error('Update todo failed:', res.statusText);
            }
        } catch (error) {
            setError('Network error while updating todo');
            console.error('Error updating todo:', error);
        }
    };

    // Delete a todo
    const deleteTodo = async (id: number) => {
        if (authLoading || !token || !user?.tenantId || !user?.id) {
            setError('User not authenticated');
            return;
        }

        try {
            let res = await fetch(`${baseUrl}/${id}`, {
                method: 'DELETE',
                headers: headers(),
            });
            if (res.status === 401) {
                const newToken = await refreshToken();
                if (!newToken) {
                    setError('Authentication failed');
                    return;
                }
                res = await fetch(`${baseUrl}/${id}`, {
                    method: 'DELETE',
                    headers: headers(),
                });
            }
            if (res.ok) {
                const data = await res.json();
                if (data.status !== 200) {
                    setError(`Failed to delete todo: ${data.body?.error || 'Unknown error'}`);
                    return;
                }
                setTodos((prev) => prev.filter((todo) => todo.id !== id));
                setError(null);
            } else {
                setError(`Failed to delete todo: ${res.statusText}`);
                console.error('Delete todo failed:', res.statusText);
            }
        } catch (error) {
            setError('Network error while deleting todo');
            console.error('Error deleting todo:', error);
        }
    };

    // Start editing a todo
    const startEditing = (id: number, text: string, category: string, due_date: string | null, priority: 'low' | 'medium' | 'high') => {
        setInteractionState({
            mode: 'edit',
            id,
            editText: text,
            editCategory: category,
            editDueDate: due_date || '',
            editPriority: priority,
        });
    };

    // Save edited todo
    const saveEdit = async (id: number) => {
        if (authLoading || !token || !user?.tenantId || !user?.id || !interactionState.editText) {
            setError('Text is required or user not authenticated');
            return;
        }

        try {
            const todoData = {
                text: interactionState.editText,
                category: interactionState.editCategory,
                due_date: interactionState.editDueDate || null,
                priority: interactionState.editPriority,
            };
            let res = await fetch(`${baseUrl}/${id}`, {
                method: 'PUT',
                headers: headers(),
                body: JSON.stringify(todoData),
            });
            if (res.status === 401) {
                const newToken = await refreshToken();
                if (!newToken) {
                    setError('Authentication failed');
                    return;
                }
                res = await fetch(`${baseUrl}/${id}`, {
                    method: 'PUT',
                    headers: headers(),
                    body: JSON.stringify(todoData),
                });
            }
            if (res.ok) {
                const data = await res.json();
                if (data.status !== 200) {
                    setError(`Failed to update todo: ${data.body?.error || 'Unknown error'}`);
                    return;
                }
                const normalizedData = normalizeTodo(data.body);
                setTodos((prev) =>
                    prev.map((todo) => (todo.id === id ? normalizedData : todo))
                );
                setError(null);
            } else {
                setError(`Failed to update todo: ${res.statusText}`);
                console.error('Update todo failed:', res.statusText);
            }
        } catch (error) {
            setError('Network error while updating todo');
            console.error('Error updating todo:', error);
        }

        setInteractionState({
            mode: 'none',
            id: null,
            editText: '',
            editCategory: 'Work',
            editDueDate: '',
            editPriority: 'low',
        });
    };

    // Cancel edit or delete action
    const cancelAction = () => {
        setInteractionState({
            mode: 'none',
            id: null,
            editText: '',
            editCategory: 'Work',
            editDueDate: '',
            editPriority: 'low',
        });
    };

    // Handle drag-and-drop events
    const handleDragStart = (event: DragEndEvent) => {
        const { active } = event;
        const todo = todos.find((t) => t.id === active.id);
        setActiveTodo(todo || null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event;
        setOverId(over ? Number(over.id) : null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id && token && user?.tenantId && user?.id) {
            const oldIndex = todos.findIndex((todo) => todo.id === active.id);
            const newIndex = todos.findIndex((todo) => todo.id === over.id);
            const reorderedTodos = arrayMove(todos, oldIndex, newIndex);
            const orderedIds = reorderedTodos.map((t) => t.id!);

            try {
                let res = await fetch(`${baseUrl}/order`, {
                    method: 'POST',
                    headers: headers(),
                    body: JSON.stringify({ orderedIds }),
                });
                if (res.status === 401) {
                    const newToken = await refreshToken();
                    if (!newToken) {
                        setError('Authentication failed');
                        return;
                    }
                    res = await fetch(`${baseUrl}/order`, {
                        method: 'POST',
                        headers: headers(),
                        body: JSON.stringify({ orderedIds }),
                    });
                }
                if (res.ok) {
                    const data = await res.json();
                    if (data.status !== 200) {
                        setError(`Failed to update todo order: ${data.body?.error || 'Unknown error'}`);
                        return;
                    }
                    setTodos(updatePositions(reorderedTodos));
                    setTodoListKey((prev) => prev + 1);
                    setError(null);
                } else {
                    setError(`Failed to update todo order: ${res.statusText}`);
                    console.error('Update order failed:', res.statusText);
                }
            } catch (error) {
                setError('Network error while updating todo order');
                console.error('Error updating order:', error);
            }
        }
        setActiveTodo(null);
        setOverId(null);
    };

    return {
        todos,
        filteredTodos,
        paginatedTodos,
        pageIndex,
        setPageIndex,
        pageSize,
        setPageSize,
        pageCount,
        filter,
        setFilter,
        categoryFilter,
        setCategoryFilter,
        interactionState,
        setInteractionState,
        addState,
        setAddState,
        activeTodo,
        overId,
        todoListKey,
        addTodo,
        toggleTodo,
        deleteTodo,
        startEditing,
        saveEdit,
        cancelAction,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        error,
        loading: authLoading,
    };
};