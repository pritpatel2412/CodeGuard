import { Switch, Route } from "wouter";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalErrorModal } from "@/components/GlobalErrorModal";
import { OnboardingModal } from "@/components/onboarding-modal";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Reviews from "@/pages/reviews";
import ReviewDetail from "@/pages/review-detail";
import Repositories from "@/pages/repositories";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Developer from "@/pages/developer";
import AuthPage from "@/pages/auth-page";
import DemoAiFixPage from "@/pages/demo-ai-fix";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";
import { withLayout } from "@/components/layout";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
          <Switch>
            <Route path="/auth" component={AuthPage} />
            <Route path="/404" component={NotFound} />
            
            {/* Protected Routes with Sidebar */}
            <ProtectedRoute path="/" component={withLayout(Dashboard)} />
            <ProtectedRoute path="/reviews" component={withLayout(Reviews)} />
            <ProtectedRoute path="/reviews/:id" component={withLayout(ReviewDetail)} />
            <ProtectedRoute path="/repositories" component={withLayout(Repositories)} />
            <ProtectedRoute path="/analytics" component={withLayout(Analytics)} />
            <ProtectedRoute path="/settings" component={withLayout(Settings)} />
            
            {/* Public Routes with Sidebar */}
            <Route path="/terms" component={withLayout(Terms)} />
            <Route path="/privacy" component={withLayout(Privacy)} />
            <Route path="/developer" component={withLayout(Developer)} />
            <Route path="/demo-ai-fix" component={withLayout(DemoAiFixPage)} />
            
            {/* Catch-all: Truly Full Screen 404 */}
            <Route component={NotFound} />
          </Switch>

          <GlobalErrorModal />
          <OnboardingModal />
          <Toaster />
          <VercelAnalytics />
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
