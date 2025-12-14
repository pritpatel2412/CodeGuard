import { SiGithub } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthPage() {
    const handleLogin = () => {
        window.location.href = "/auth/github";
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Welcome to PR Reviewer</CardTitle>
                    <CardDescription>
                        Sign in with GitHub to manage your repositories and get AI-powered reviews.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        className="w-full flex items-center gap-2"
                        size="lg"
                        onClick={handleLogin}
                    >
                        <SiGithub className="w-5 h-5" />
                        Sign in with GitHub
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
