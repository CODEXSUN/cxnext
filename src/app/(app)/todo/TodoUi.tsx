// TodoUi.tsx - No major changes needed, but ensure cn is imported if used, and handle Health category via updated TodoData.ts
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/components/lib/utils';
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
import { Todo, InteractionState, AddState, categories, categoryIcons, formatDate } from './TodoData';
import { getPageNumbers } from '@/components/lib/utils';
import { ChevronLeftIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon, ChevronRightIcon } from "@radix-ui/react-icons";

// Section 1: Interfaces
// Defines the props for the SortableTodoItem component, which handles individual todo rendering and interactions.
interface SortableTodoItemProps {
    todo: Todo;
    toggleTodo: (id: number) => void;
    deleteTodo: (id: number) => void;
    startEditing: (id: number, text: string, category: string, due_date: string | null, priority: 'low' | 'medium' | 'high') => void;
    interactionState: InteractionState;
    setInteractionState: React.Dispatch<React.SetStateAction<InteractionState>>;
    saveEdit: (id: number) => void;
    cancelAction: () => void;
    overId: number | null;
}

// Section 2: SortableTodoItem Component
// Renders a single sortable todo item, handling drag-and-drop, editing mode, and actions like toggle, edit, and delete.
// - Uses useSortable hook for drag-and-drop functionality.
// - Conditionally renders edit form or view mode based on interactionState.
// - Displays todo details (text, category, due date, priority) with appropriate styling.
const SortableTodoItem: React.FC<SortableTodoItemProps> = ({
                                                               todo,
                                                               toggleTodo,
                                                               deleteTodo,
                                                               startEditing,
                                                               interactionState,
                                                               setInteractionState,
                                                               saveEdit,
                                                               cancelAction,
                                                               overId,
                                                           }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: todo.id!,
    });

    const isOver = overId === todo.id && !isDragging;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? transition : 'none',
    };

    const CategoryIcon = categoryIcons[todo.category] || (() => null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit(todo.id!);
        }
    };

    if (interactionState.mode === 'edit' && interactionState.id === todo.id) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                    'flex items-center p-4 bg-background border border-gray-200 rounded-lg shadow-sm mb-2',
                    'hover:shadow-md transition-shadow duration-200'
                )}
            >
                <Input
                    value={interactionState.editText}
                    onChange={(e) =>
                        setInteractionState((prev) => ({ ...prev, editText: e.target.value }))
                    }
                    onKeyDown={handleKeyDown}
                    className="flex-1 mr-2"
                    placeholder="Edit todo..."
                />
                <Select
                    value={interactionState.editCategory}
                    onValueChange={(value) =>
                        setInteractionState((prev) => ({ ...prev, editCategory: value }))
                    }
                >
                    <SelectTrigger className="w-[120px] mr-2">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    type="date"
                    value={interactionState.editDueDate}
                    onChange={(e) =>
                        setInteractionState((prev) => ({ ...prev, editDueDate: e.target.value }))
                    }
                    className="w-[150px] mr-2"
                />
                <Select
                    value={interactionState.editPriority}
                    onValueChange={(value) =>
                        setInteractionState((prev) => ({ ...prev, editPriority: value as 'low' | 'medium' | 'high' }))
                    }
                >
                    <SelectTrigger className="w-[120px] mr-2">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        {['low', 'medium', 'high'].map((pri) => (
                            <SelectItem key={pri} value={pri}>
                                {pri.charAt(0).toUpperCase() + pri.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => saveEdit(todo.id!)} className="text-green-600 mr-1">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
                'flex items-center p-4 bg-background border border-gray-200 rounded-lg shadow-sm mb-2',
                'hover:shadow-md transition-shadow duration-200',
                isDragging && 'opacity-50',
                isOver && 'border-blue-500 shadow-lg',
                todo.completed && 'opacity-75'
            )}
        >
            <div {...listeners} className="cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5 text-gray-400 mr-2" />
            </div>
            <span className="w-8 text-gray-500 font-medium">{todo.id}.</span>
            <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id!)}
                className="mr-3"
            />
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
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                        startEditing(
                            todo.id!,
                            todo.text,
                            todo.category,
                            todo.due_date,
                            todo.priority
                        )
                    }
                    className="text-gray-500"
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTodo(todo.id!)}
                    className="text-gray-500"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
};

// Section 3: TodoList Component
// Renders the entire todo list UI, including error/loading display, add form, filters, sortable items with drag-and-drop, and pagination with record count.
interface TodoListProps {
    todos: Todo[];
    filteredTodos: Todo[];
    paginatedTodos: Todo[];
    pageIndex: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
    pageSize: number;
    setPageSize: React.Dispatch<React.SetStateAction<number>>;
    pageCount: number;
    filter: 'all' | 'completed' | 'active';
    setFilter: React.Dispatch<React.SetStateAction<'all' | 'completed' | 'active'>>;
    categoryFilter: string;
    setCategoryFilter: React.Dispatch<React.SetStateAction<string>>;
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
    startEditing: (id: number, text: string, category: string, due_date: string | null, priority: 'low' | 'medium' | 'high') => void;
    saveEdit: (id: number) => void;
    cancelAction: () => void;
    handleDragStart: (event: DragEndEvent) => void;
    handleDragOver: (event: DragOverEvent) => void;
    handleDragEnd: (event: DragEndEvent) => void;
    error: string | null;
    loading: boolean;
}

export const TodoList: React.FC<TodoListProps> = ({
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
                                                      loading,
                                                  }) => {
    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor)
    );

    // Section 3.1: Error and Loading Display
    // Displays loading indicator or error messages if authentication or API calls fail (e.g., 401 Unauthorized).
    const renderError = () => (
        <>
            {loading && (
                <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
                    Loading...
                </div>
            )}
            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}
        </>
    );

    // Section 3.2: Add Section
    // Always renders the add form for creating new todos. Uses addState to manage inputs, independent of edit state.
    // - Standard shadcn Button for adding todos, no cancel button.
    // - Maintains spacing with mb-6 for visual separation.
    const renderAddSection = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm mb-6"
        >
            <Input
                value={addState.addText}
                onChange={(e) =>
                    setAddState((prev) => ({ ...prev, addText: e.target.value }))
                }
                className="flex-1 mr-2"
                placeholder="Add new todo..."
            />
            <Select
                value={addState.addCategory}
                onValueChange={(value) =>
                    setAddState((prev) => ({ ...prev, addCategory: value }))
                }
            >
                <SelectTrigger className="w-[120px] mr-2">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                            {cat}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Input
                type="date"
                value={addState.addDueDate}
                onChange={(e) =>
                    setAddState((prev) => ({ ...prev, addDueDate: e.target.value }))
                }
                className="w-[150px] mr-2"
            />
            <Select
                value={addState.addPriority}
                onValueChange={(value) =>
                    setAddState((prev) => ({ ...prev, addPriority: value as 'low' | 'medium' | 'high' }))
                }
            >
                <SelectTrigger className="w-[120px] mr-2">
                    <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                    {['low', 'medium', 'high'].map((pri) => (
                        <SelectItem key={pri} value={pri}>
                            {pri.charAt(0).toUpperCase() + pri.slice(1)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={addTodo} variant="default" className="w-10%">
                Add Todo
            </Button>
        </motion.div>
    );

    // Section 3.3: Filters Section
    // Renders dropdown filters for todo status (all, active, completed) and category (Work, Personal, Other, all).
    const renderFilters = () => (
        <div className="flex justify-between mb-6">
            <Select value={filter} onValueChange={(value) => setFilter(value as 'all' | 'completed' | 'active')}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                            {cat}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );

    // Section 3.4: Pagination Section
    // Renders pagination controls including page size selection, page numbers, navigation buttons, and number of records.
    const renderPagination = () => {
        const currentPage = pageIndex + 1;
        const pageNumbers = getPageNumbers(currentPage, pageCount);
        const totalRecords = filteredTodos.length;
        const startRecord = pageIndex * pageSize + 1;
        const endRecord = Math.min((pageIndex + 1) * pageSize, totalRecords);

        return (
            <div className="flex items-center justify-between px-2 mt-6">
                <div className="flex items-center gap-2">
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                            setPageSize(Number(value));
                            setPageIndex(0); // Reset to first page on size change
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50, 100, 500, 1000].map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                        Rows per page
                    </p>
                </div>
                <p className="text-sm text-muted-foreground">
                    Showing {startRecord} to {endRecord} of {totalRecords} records
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="size-8 p-0"
                        onClick={() => setPageIndex(0)}
                        disabled={pageIndex === 0}
                    >
                        <span className="sr-only">Go to first page</span>
                        <DoubleArrowLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8 p-0"
                        onClick={() => setPageIndex(pageIndex - 1)}
                        disabled={pageIndex === 0}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    {pageNumbers.map((pageNumber, index) => (
                        <div key={`${pageNumber}-${index}`} className="flex items-center">
                            {pageNumber === '...' ? (
                                <span className="text-muted-foreground px-1 text-sm">...</span>
                            ) : (
                                <Button
                                    variant={currentPage === pageNumber ? 'default' : 'outline'}
                                    className="h-8 min-w-8 px-2"
                                    onClick={() => setPageIndex((pageNumber as number) - 1)}
                                >
                                    <span className="sr-only">Go to page {pageNumber}</span>
                                    {pageNumber}
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        variant="outline"
                        className="size-8 p-0"
                        onClick={() => setPageIndex(pageIndex + 1)}
                        disabled={pageIndex + 1 === pageCount}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8 p-0"
                        onClick={() => setPageIndex(pageCount - 1)}
                        disabled={pageIndex + 1 === pageCount}
                    >
                        <span className="sr-only">Go to last page</span>
                        <DoubleArrowRightIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div>
            {renderError()}
            {renderAddSection()}
            {renderFilters()}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext
                    key={todoListKey}
                    items={paginatedTodos.map((todo) => todo.id!)}
                    strategy={verticalListSortingStrategy}
                >
                    {paginatedTodos.map((todo) => (
                        <SortableTodoItem
                            key={todo.id}
                            todo={todo}
                            toggleTodo={toggleTodo}
                            deleteTodo={deleteTodo}
                            startEditing={startEditing}
                            interactionState={interactionState}
                            setInteractionState={setInteractionState}
                            saveEdit={saveEdit}
                            cancelAction={cancelAction}
                            overId={overId}
                        />
                    ))}
                </SortableContext>

                <DragOverlay>
                    {activeTodo ? (
                        <div
                            className={cn(
                                'flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm mb-2',
                                activeTodo.completed && 'opacity-75'
                            )}
                        >
                            <GripVertical className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="w-8 text-gray-500 font-medium">{activeTodo.id}.</span>
                            <Checkbox
                                checked={activeTodo.completed}
                                disabled
                                className="mr-3"
                            />
                            <div className="flex-1 flex items-center gap-2">
                                <span
                                    className={cn(
                                        'flex-1 flex items-center gap-2',
                                        activeTodo.completed && 'line-through text-gray-500'
                                    )}
                                >
                                    {activeTodo.text}{' '}
                                    <span className="text-sm text-gray-400 flex items-center gap-1">
                                        {(() => {
                                            const Icon = categoryIcons[activeTodo.category] || (() => null);
                                            return <Icon className="w-4 h-4" />;
                                        })()}
                                        {activeTodo.category}
                                    </span>
                                </span>
                                <div className="flex items-center gap-2 border-l border-gray-300 pl-2">
                                    <span
                                        className={cn('text-sm', activeTodo.completed ? 'text-gray-500' : 'text-gray-600')}
                                    >
                                        {formatDate(activeTodo.due_date)}
                                    </span>
                                    <span
                                        className={cn(
                                            'text-sm capitalize',
                                            activeTodo.priority === 'low' && 'text-green-600',
                                            activeTodo.priority === 'medium' && 'text-yellow-600',
                                            activeTodo.priority === 'high' && 'text-red-600',
                                            activeTodo.completed && 'text-gray-500'
                                        )}
                                    >
                                        {activeTodo.priority}
                                    </span>
                                </div>
                                <Button variant="ghost" size="icon" disabled className="text-gray-500">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {renderPagination()}
        </div>
    );
};