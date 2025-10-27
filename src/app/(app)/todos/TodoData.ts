import { Briefcase, User, Layers, Heart } from 'lucide-react';
import React from "react";

export interface Todo {
    id: number;
    title: string;
    completed: boolean;
    category_id: number | null;
    category?: { id: number; name: string };
    due_date: string | null;
    priority_id: number | null;
    priority?: { id: number; name: string };
    user_id: string;
    position: number;
    active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface InteractionState {
    mode: 'none' | 'edit';
    id: number | null;
    editText: string;
    editCategoryId: number | null;
    editDueDate: string;
    editPriorityId: number | null;
}

export interface AddState {
    addText: string;
    addCategoryId: number | null;
    addDueDate: string;
    addPriorityId: number | null;
}

// Hardcoded dropdowns (must match DB)
export const categories = [
    { id: 1, name: 'Work' },
    { id: 2, name: 'Personal' },
    { id: 3, name: 'Other' },
    { id: 4, name: 'Health' },
];

export const priorities = [
    { id: 1, name: 'Low' },
    { id: 2, name: 'Medium' },
    { id: 3, name: 'High' },
];

export const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    Work: Briefcase,
    Personal: User,
    Other: Layers,
    Health: Heart,
};

export const formatDate = (date: string | null): string => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};