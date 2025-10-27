import { useState, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { Todo, InteractionState, AddState, categories, priorities } from './TodoData';
import { useAuth } from '@/global/auth/useAuth';

const updatePositions = (todos: Todo[]): Todo[] =>
    todos.map((todo, i) => ({ ...todo, position: i + 1 }));

const normalizeTodo = (todo: any): Todo => ({
    id: todo.id,
    title: todo.title,
    completed: !!todo.completed,
    category_id: todo.category_id,
    category: todo.category || undefined,
    due_date: todo.due_date || null,
    priority_id: todo.priority_id,
    priority: todo.priority || undefined,
    user_id: todo.user_id,
    position: todo.position ?? 0,
    active: !!todo.active,
    created_at: todo.created_at,
    updated_at: todo.updated_at,
});

export const useTodoLogic = () => {
    const { token, user, API_URL, loading: authLoading, headers } = useAuth();
    const baseUrl = `${API_URL}/todos`;
    const refreshUrl = `${API_URL}/auth/refresh`;

    const [todos, setTodos] = useState<Todo[]>([]);
    const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [interactionState, setInteractionState] = useState<InteractionState>({
        mode: 'none',
        id: null,
        editText: '',
        editCategoryId: null,
        editDueDate: '',
        editPriorityId: null,
    });
    const [addState, setAddState] = useState<AddState>({
        addText: '',
        addCategoryId: 1,
        addDueDate: '',
        addPriorityId: 1,
    });
    const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
    const [overId, setOverId] = useState<number | null>(null);
    const [todoListKey, setTodoListKey] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    // === Derived ===
    const filteredTodos = todos.filter(t => {
        const status = filter === 'all' ||
            (filter === 'completed' && t.completed) ||
            (filter === 'active' && !t.completed);
        const cat = categoryFilter === 'all' || t.category?.name === categoryFilter;
        return status && cat;
    });

    const pageCount = Math.ceil(filteredTodos.length / pageSize);
    const paginatedTodos = filteredTodos.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

    // === Token Refresh ===
    const refreshToken = async () => {
        try {
            const res = await fetch(refreshUrl, { method: 'POST', headers: headers() });
            if (!res.ok) throw new Error();
            const { token: newToken } = await res.json();
            return newToken;
        } catch {
            setError('Token refresh failed');
            return null;
        }
    };

    // === Fetch Todos ===
    useEffect(() => {
        if (authLoading || !token || !user?.id) return;

        const fetchTodos = async () => {
            try {
                let res = await fetch(`${baseUrl}?per_page=100`, { headers: headers() });
                if (res.status === 401) {
                    const nt = await refreshToken(); if (!nt) return;
                    res = await fetch(`${baseUrl}?per_page=100`, { headers: headers() });
                }
                if (!res.ok) throw new Error(res.statusText);
                const json = await res.json();
                const normalized = (json.data || []).map(normalizeTodo);
                setTodos(normalized.sort((a, b) => a.position - b.position));
                setTotal(json.total || 0);
                setError(null);
            } catch (e: any) {
                setError(e.message || 'Failed to load todos');
            }
        };
        fetchTodos();
    }, [authLoading, token, user?.id, baseUrl]);

    // === CRUD ===
    const addTodo = async () => {
        if (!addState.addText.trim()) return setError('Title is required');

        const payload = {
            title: addState.addText,
            completed: false,
            category_id: addState.addCategoryId,
            due_date: addState.addDueDate || null,
            priority_id: addState.addPriorityId,
            position: todos.length + 1,
            active: true,
        };

        try {
            let res = await fetch(baseUrl, { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
            if (res.status === 401) {
                const nt = await refreshToken(); if (!nt) return;
                res = await fetch(baseUrl, { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
            }
            if (!res.ok) throw new Error('Create failed');
            const { data } = await res.json();
            setTodos(p => [...p, normalizeTodo(data)].sort((a, b) => a.position - b.position));
            setAddState({ addText: '', addCategoryId: 1, addDueDate: '', addPriorityId: 1 });
        } catch (e: any) { setError(e.message); }
    };

    const toggleTodo = async (id: number) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        try {
            let res = await fetch(`${baseUrl}/${id}`, {
                method: 'PUT',
                headers: headers(),
                body: JSON.stringify({ completed: !todo.completed })
            });
            if (res.status === 401) {
                const nt = await refreshToken(); if (!nt) return;
                res = await fetch(`${baseUrl}/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify({ completed: !todo.completed }) });
            }
            if (!res.ok) throw new Error();
            const { data } = await res.json();
            setTodos(p => p.map(t => t.id === id ? normalizeTodo(data) : t));
        } catch (e: any) { setError(e.message); }
    };

    const deleteTodo = async (id: number) => {
        try {
            let res = await fetch(`${baseUrl}/${id}`, { method: 'DELETE', headers: headers() });
            if (res.status === 401) {
                const nt = await refreshToken(); if (!nt) return;
                res = await fetch(`${baseUrl}/${id}`, { method: 'DELETE', headers: headers() });
            }
            if (!res.ok) throw new Error();
            setTodos(p => p.filter(t => t.id !== id));
        } catch (e: any) { setError(e.message); }
    };

    const startEditing = (todo: Todo) => {
        setInteractionState({
            mode: 'edit',
            id: todo.id,
            editText: todo.title,
            editCategoryId: todo.category_id,
            editDueDate: todo.due_date || '',
            editPriorityId: todo.priority_id,
        });
    };

    const saveEdit = async (id: number) => {
        if (!interactionState.editText.trim()) return setError('Title required');

        const payload = {
            title: interactionState.editText,
            category_id: interactionState.editCategoryId,
            due_date: interactionState.editDueDate || null,
            priority_id: interactionState.editPriorityId,
        };

        try {
            let res = await fetch(`${baseUrl}/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(payload) });
            if (res.status === 401) {
                const nt = await refreshToken(); if (!nt) return;
                res = await fetch(`${baseUrl}/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(payload) });
            }
            if (!res.ok) throw new Error();
            const { data } = await res.json();
            setTodos(p => p.map(t => t.id === id ? normalizeTodo(data) : t));
            cancelAction();
        } catch (e: any) { setError(e.message); }
    };

    const cancelAction = () => {
        setInteractionState({
            mode: 'none',
            id: null,
            editText: '',
            editCategoryId: null,
            editDueDate: '',
            editPriorityId: null,
        });
    };

    // === Drag & Drop ===
    const handleDragStart = (e: DragEndEvent) => setActiveTodo(todos.find(t => t.id === e.active.id) || null);
    const handleDragOver = (e: DragOverEvent) => setOverId(e.over ? Number(e.over.id) : null);

    const handleDragEnd = async (e: DragEndEvent) => {
        const { active, over } = e;
        if (!over || active.id === over.id) return;

        const oldIdx = todos.findIndex(t => t.id === active.id);
        const newIdx = todos.findIndex(t => t.id === over.id);
        const reordered = arrayMove(todos, oldIdx, newIdx);
        const orderedIds = reordered.map(t => t.id);

        try {
            let res = await fetch(`${baseUrl}/reorder`, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify({ ordered_ids: orderedIds })
            });
            if (res.status === 401) {
                const nt = await refreshToken(); if (!nt) return;
                res = await fetch(`${baseUrl}/reorder`, { method: 'POST', headers: headers(), body: JSON.stringify({ ordered_ids: orderedIds }) });
            }
            if (!res.ok) throw new Error();
            setTodos(updatePositions(reordered));
            setTodoListKey(k => k + 1);
        } catch (e: any) { setError(e.message); }

        setActiveTodo(null);
        setOverId(null);
    };

    return {
        todos, filteredTodos, paginatedTodos,
        pageIndex, setPageIndex, pageSize, setPageSize, pageCount, total,
        filter, setFilter, categoryFilter, setCategoryFilter,
        interactionState, setInteractionState,
        addState, setAddState,
        activeTodo, overId, todoListKey,
        addTodo, toggleTodo, deleteTodo,
        startEditing, saveEdit, cancelAction,
        handleDragStart, handleDragOver, handleDragEnd,
        error, loading: authLoading,
    };
};