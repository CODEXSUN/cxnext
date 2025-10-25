// app/login/page.tsx
'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/global/auth/useAuth";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email.trim() || !password.trim()) {
            setError("Please fill in both email and password.");
            return;
        }
        console.log('[LoginPage] Attempting login...');
        const success = await login(email, password);
        if (success) {
            console.log('[LoginPage] Login successful, redirecting to dashboard.');
            router.replace("/dashboard");
        } else {
            setError("Invalid credentials");
            console.log('[LoginPage] Login failed.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
                {error && (
                    <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                )}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Email"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Password"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        Login
                    </button>
                </div>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Don&#39;t have an account? <Link href="/signup" className="text-blue-500 hover:underline">Sign up</Link>
                </p>
            </form>
        </div>
    );
}