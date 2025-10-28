// app/(auth)/credentials/page.tsx
'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/global/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, CheckCircle, XCircle, Shield, UserCheck } from "lucide-react";
import { API_URL } from "@/config";

interface VerificationResponse {
    valid: boolean;
    message?: string;
    user?: any;
}

export default function CredentialsPage() {
    const { user, token, headers, logout } = useAuth();
    const [verifying, setVerifying] = useState(false);
    const [verification, setVerification] = useState<VerificationResponse | null>(null);
    const [lastVerified, setLastVerified] = useState<string | null>(null);

    // Auto-verify on mount if user exists
    useEffect(() => {
        if (user && token) {
            verifyToken();
        }
    }, []);

    const verifyToken = async () => {
        if (!token || !user) return;

        setVerifying(true);
        setVerification(null);

        try {
            const res = await fetch(`${API_URL}/user`, {
                method: "GET",
                headers: headers(),
            });

            const data = await res.json();

            if (res.ok && data.user) {
                const isMatch =
                    data.user.id.toString() === user.id &&
                    data.user.email === user.email &&
                    data.user.active === user.active;

                setVerification({
                    valid: isMatch,
                    message: isMatch ? "Token and user data are valid and in sync." : "Data mismatch with backend.",
                    user: data.user,
                });
            } else {
                setVerification({
                    valid: false,
                    message: data.message || "Invalid or expired token.",
                });
            }
        } catch (error) {
            setVerification({
                valid: false,
                message: "Failed to connect to backend.",
            });
        } finally {
            setVerifying(false);
            setLastVerified(new Date().toLocaleString());
        }
    };

    if (!user || !token) {
        return (
            <div className="container max-w-2xl mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-500" />
                            Not Authenticated
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert>
                            <AlertDescription>
                                No authentication data found. Please <a href="/login" className="underline font-medium">log in</a> first.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Shield className="w-8 h-8 text-primary" />
                        Authentication Credentials
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        View your current session, roles, permissions, and verify token with backend.
                    </p>
                </div>
                <Button onClick={verifyToken} disabled={verifying} size="lg">
                    {verifying ? (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Verify Now
                        </>
                    )}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* User Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserCheck className="w-5 h-5" />
                            User Profile
                        </CardTitle>
                        <CardDescription>Currently logged-in user details from localStorage</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">ID</p>
                                <p className="font-mono text-sm">{user.id}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                <Badge variant={user.active ? "default" : "destructive"}>
                                    {user.active ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p className="text-lg font-semibold">{user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p className="font-mono">{user.email}</p>
                        </div>
                        {user.tenantId && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tenant ID</p>
                                <p className="font-mono text-sm">{user.tenantId}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Token Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Access Token</CardTitle>
                        <CardDescription>Sanctum token used for API authentication</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Token Preview</p>
                                <code className="text-xs break-all bg-muted p-2 rounded block font-mono">
                                    {token.slice(0, 20)}...{token.slice(-10)}
                                </code>
                            </div>
                            <Separator />
                            <div className="text-xs text-muted-foreground">
                                <p>Full token is stored securely in localStorage and sent via <code>Authorization: Bearer</code> header.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Roles */}
            <Card>
                <CardHeader>
                    <CardTitle>Roles</CardTitle>
                    <CardDescription>User has the following roles</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                                <Badge key={role.id} variant="secondary" className="text-sm">
                                    {role.name}
                                </Badge>
                            ))
                        ) : (
                            <p className="text-muted-foreground">No roles assigned</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
                <CardHeader>
                    <CardTitle>Permissions</CardTitle>
                    <CardDescription>
                        {user.permissions.length} permission(s) granted via roles
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="columns-2 sm:columns-3 gap-2 space-y-1">
                        {user.permissions.length > 0 ? (
                            user.permissions.map((perm, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                    <code className="text-xs">{perm}</code>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground">No permissions</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Verification Result */}
            {verification && (
                <Card className={verification.valid ? "border-green-500" : "border-red-500"}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {verification.valid ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            Token Verification Result
                        </CardTitle>
                        <CardDescription>
                            Last checked: {lastVerified}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert variant={verification.valid ? "default" : "destructive"}>
                            <AlertDescription>
                                <strong>{verification.valid ? "Valid" : "Invalid"}</strong>: {verification.message}
                            </AlertDescription>
                        </Alert>
                        {!verification.valid && (
                            <div className="mt-4">
                                <Button variant="destructive" onClick={logout} size="sm">
                                    Force Logout
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Loading State */}
            {verifying && (
                <Card>
                    <CardContent className="py-8">
                        <div className="flex flex-col items-center space-y-4">
                            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Verifying token with backend...</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}