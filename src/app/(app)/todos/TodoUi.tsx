'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { GripVertical, Pencil, Trash2, Check, X } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Todo, InteractionState, AddState, categories, priorities, categoryIcons, formatDate } from './TodoData';
import { getPageNumbers } from '@/lib/utils';
import { ChevronLeftIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import {toast} from "sonner";

interface TodoListProps {
    todos: Todo[];
    filteredTodos: Todo[];
    paginatedTodos: Todo[];
    pageIndex: number;
    setPageIndex: (i: number) => void;
    pageSize: number;
    setPageSize: (s: number) => void;
    pageCount: number;
    filter: string;
    setFilter: (f: string) => void;
    categoryFilter: string;
    setCategoryFilter: (c: string) => void;
    interactionState: InteractionState;
    setInteractionState: React.Dispatch<React.SetStateAction<InteractionState>>;
    addState: AddState;
    setAddState: React.Dispatch<React.SetStateAction<AddState>>;
    activeTodo: Todo | null;
    overId: number | null;
    todoListKey: number;
    addTodo: () => void;
    toggleTodo: (id: number) => void;
    deleteTodo: (id: number) => void;
    startEditing: (todo: Todo) => void;
    saveEdit: (id: number) => void;
    cancelAction: () => void;
    handleDragStart: (e: DragEndEvent) => void;
    handleDragOver: (e: DragOverEvent) => void;
    handleDragEnd: (e: DragEndEvent) => void;
    error: string | null;
}

const SortableTodoItem: React.FC<{
    todo: Todo;
    toggleTodo: (id: number) => void;
    deleteTodo: (id: number) => void;
    startEditing: (todo: Todo) => void;
    interactionState: InteractionState;
    setInteractionState: React.Dispatch<React.SetStateAction<InteractionState>>;
    saveEdit: (id: number) => void;
    cancelAction: () => void;
    overId: number | null;
}> = ({ todo, toggleTodo, deleteTodo, startEditing, interactionState, setInteractionState, saveEdit, cancelAction, overId }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id });
    const isOver = overId === todo.id && !isDragging;
    const style = { transform: CSS.Transform.toString(transform), transition: isDragging ? transition : 'none' };

    const CategoryIcon = todo.category ? categoryIcons[todo.category.name] || null : null;

    if (interactionState.mode === 'edit' && interactionState.id === todo.id) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex items-center p-4 bg-background border rounded-lg shadow-sm mb-2')}
            >
                <Input
                    value={interactionState.editText}
                    onChange={e => setInteractionState(p => ({ ...p, editText: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && saveEdit(todo.id)}
                    className="flex-1 mr-2"
                    placeholder="Edit title..."
                />
                <Select
                    value={interactionState.editCategoryId?.toString() || ''}
                    onValueChange={v => setInteractionState(p => ({ ...p, editCategoryId: v ? Number(v) : null }))}
                >
                    <SelectTrigger className="w-[120px] mr-2">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input type="date" value={interactionState.editDueDate} onChange={e => setInteractionState(p => ({ ...p, editDueDate: e.target.value }))} className="w-[150px] mr-2" />
                <Select
                    value={interactionState.editPriorityId?.toString() || ''}
                    onValueChange={v => setInteractionState(p => ({ ...p, editPriorityId: v ? Number(v) : null }))}
                >
                    <SelectTrigger className="w-[120px] mr-2">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {priorities.map(p => (
                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => saveEdit(todo.id)} className="text-green-600">
                    <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={cancelAction} className="text-red-600">
                    <X className="h-4 w-4" />
                </Button>
            </motion.div>
        );
    }

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={cn(
                'flex items-center p-4 bg-white border rounded-lg shadow-sm mb-2 cursor-pointer',
                isOver && 'ring-2 ring-blue-500',
                todo.completed && 'opacity-70'
            )}
        >
            <div {...listeners} className="mr-2">
                <GripVertical className="w-5 h-5 text-gray-400" />
            </div>
            <span className="w-8 text-gray-500 font-medium">{todo.id}.</span>
            <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} className="mr-3" />
            <div className="flex-1 flex items-center gap-2">
                <span className={cn('flex-1 flex items-center gap-2', todo.completed && 'line-through text-gray-500')}>
                    {todo.title}
                    {todo.category && CategoryIcon && (
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                            <CategoryIcon className="w-4 h-4" />
                            {todo.category.name}
                        </span>
                    )}
                </span>
                <div className="flex items-center gap-2 border-l pl-2 text-sm">
                    <span className={cn(todo.completed ? 'text-gray-500' : 'text-gray-600')}>
                        {formatDate(todo.due_date)}
                    </span>
                    <span className={cn(
                        'capitalize',
                        todo.priority?.name === 'Low' && 'text-green-600',
                        todo.priority?.name === 'Medium' && 'text-yellow-600',
                        todo.priority?.name === 'High' && 'text-red-600',
                        todo.completed && 'text-gray-500'
                    )}>
                        {todo.priority?.name}
                    </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => startEditing(todo)}>
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo.id)} className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
};

export const TodoList: React.FC<TodoListProps> = (props) => {
    const {
        paginatedTodos, pageIndex, setPageIndex, pageCount,
        addState, setAddState, addTodo,
        filter, setFilter, categoryFilter, setCategoryFilter,
        error, interactionState, todoListKey,
        handleDragStart, handleDragOver, handleDragEnd, activeTodo, overId,
    } = props;

    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor), useSensor(KeyboardSensor));

    const renderError = () => error && toast.error(error);

    const renderAddSection = () => (
        <div className="flex gap-2 mb-4">
            <Input
                value={addState.addText}
                onChange={e => setAddState(p => ({ ...p, addText: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addTodo()}
                placeholder="New todo title..."
                className="flex-1"
            />
            <Select value={addState.addCategoryId?.toString() || ''} onValueChange={v => setAddState(p => ({ ...p, addCategoryId: Number(v) }))}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Input type="date" value={addState.addDueDate} onChange={e => setAddState(p => ({ ...p, addDueDate: e.target.value }))} className="w-[150px]" />
            <Select value={addState.addPriorityId?.toString() || ''} onValueChange={v => setAddState(p => ({ ...p, addPriorityId: Number(v) }))}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {priorities.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Button onClick={addTodo}>Add</Button>
        </div>
    );

    const renderFilters = () => (
        <div className="flex gap-2 mb-4">
            <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
    );

    const renderPagination = () => {
        const pageNumbers = getPageNumbers(pageIndex + 1, pageCount);
        const currentPage = pageIndex + 1;

        return (
            <div className="flex justify-center items-center gap-1 mt-4">
                <Button variant="outline" size="icon" onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>
                    <DoubleArrowLeftIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setPageIndex(pageIndex - 1)} disabled={pageIndex === 0}>
                    <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                {pageNumbers.map((n, i) => n === '...' ? (
                    <span key={i} className="px-2 text-sm text-muted-foreground">...</span>
                ) : (
                    <Button key={i} variant={currentPage === n ? 'default' : 'outline'} size="icon" onClick={() => setPageIndex((n as number) - 1)}>
                        {n}
                    </Button>
                ))}
                <Button variant="outline" size="icon" onClick={() => setPageIndex(pageIndex + 1)} disabled={pageIndex + 1 >= pageCount}>
                    <ChevronRightIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setPageIndex(pageCount - 1)} disabled={pageIndex + 1 >= pageCount}>
                    <DoubleArrowRightIcon className="h-4 w-4" />
                </Button>
            </div>
        );
    };

    return (
        <div>
            {renderError()}
            {renderAddSection()}
            {renderFilters()}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                <SortableContext key={todoListKey} items={paginatedTodos.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {paginatedTodos.map(todo => (
                        <SortableTodoItem
                            key={todo.id}
                            todo={todo}
                            toggleTodo={props.toggleTodo}
                            deleteTodo={props.deleteTodo}
                            startEditing={props.startEditing}
                            interactionState={interactionState}
                            setInteractionState={props.setInteractionState}
                            saveEdit={props.saveEdit}
                            cancelAction={props.cancelAction}
                            overId={overId}
                        />
                    ))}
                </SortableContext>

                <DragOverlay>
                    {activeTodo && (
                        <div className={cn('flex items-center p-4 bg-white border rounded-lg shadow-lg', activeTodo.completed && 'opacity-75')}>
                            <GripVertical className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="w-8 text-gray-500 font-medium">{activeTodo.id}.</span>
                            <Checkbox checked={activeTodo.completed} disabled className="mr-3" />
                            <div className="flex-1">
                                <span className={cn(activeTodo.completed && 'line-through text-gray-500')}>
                                    {activeTodo.title}
                                    {activeTodo.category && (
                                        <span className="ml-2 text-sm text-gray-400">
                                            <span className="inline-flex items-center gap-1">
                                                {categoryIcons[activeTodo.category.name] && React.createElement(categoryIcons[activeTodo.category.name], { className: 'w-4 h-4' })}
                                                {activeTodo.category.name}
                                            </span>
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            {renderPagination()}
        </div>
    );
};