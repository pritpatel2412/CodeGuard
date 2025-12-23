import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useErrorStore, type ErrorType } from "@/lib/error-store";
import { AlertCircle, Clock, ShieldAlert, WifiOff } from "lucide-react";

export function GlobalErrorModal() {
    const { isOpen, type, message, closeError } = useErrorStore();

    const getContent = (type: ErrorType | null) => {
        switch (type) {
            case "rate_limit":
                return {
                    title: "High Traffic Volume",
                    description:
                        "We're currently experiencing a high volume of requests. To ensure fair usage for everyone, please wait a moment before trying again.",
                    icon: <Clock className="h-12 w-12 text-orange-500 mb-4" />,
                };
            case "unauthorized":
                return {
                    title: "Authentication Issue",
                    description:
                        "We're having trouble verifying your credentials. Please check your configuration or try refreshing the page.",
                    icon: <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />,
                };
            case "server_error":
                return {
                    title: "Service Unavailable",
                    description:
                        "Our servers are currently facing some issues. Our team has been notified and we're working to fix it. Please try again later.",
                    icon: <AlertCircle className="h-12 w-12 text-destructive mb-4" />,
                };
            case "connection_error":
                return {
                    title: "Connection Lost",
                    description:
                        "We can't reach the server. Please check your internet connection and try again.",
                    icon: <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />,
                };
            default:
                return {
                    title: "Something went wrong",
                    description: message || "An unexpected error occurred. Please try again.",
                    icon: <AlertCircle className="h-12 w-12 text-destructive mb-4" />,
                };
        }
    };

    const content = getContent(type);

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeError()}>
            <AlertDialogContent className="sm:max-w-[425px] text-center flex flex-col items-center">
                <AlertDialogHeader className="flex flex-col items-center">
                    {content.icon}
                    <AlertDialogTitle className="text-xl font-bold">
                        {content.title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base mt-2">
                        {content.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex justify-center mt-6 w-full">
                    <Button onClick={closeError} className="min-w-[120px]">
                        Okay, I understand
                    </Button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
