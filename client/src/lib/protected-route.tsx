import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
    component: Component,
    path,
    children,
}: {
    component?: React.ComponentType<any>;
    path: string;
    children?: React.ReactNode | ((params: any) => React.ReactNode);
}) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Route path={path}>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-border" />
                </div>
            </Route>
        );
    }

    if (!user) {
        return (
            <Route path={path}>
                <Redirect to="/auth" />
            </Route>
        );
    }

    if (children) {
        return <Route path={path}>{children}</Route>;
    }

    return <Route path={path} component={Component} />;
}
