'use client';

import { TodoList } from './TodoUi';
import { Toaster } from '@/components/ui/sonner';
import { Loader } from "@/components/loader/loader";
import { useTodoLogic } from './TodoLogic';
import React from "react";

export default function TodosPage() {
    const logic = useTodoLogic();

    if (logic.loading) return <Loader />;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Todos Management</h1>
            <TodoList {...logic} />
            <Toaster />
        </div>
    );
}