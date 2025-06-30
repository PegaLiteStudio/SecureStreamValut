import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { checkAuthStatus } from "./lib/auth";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Videos from "@/pages/videos";
import Folders from "@/pages/folders";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Layout from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

function AuthWrapper() {
  const { data: authStatus, isLoading } = useQuery({
    queryKey: ['/api/auth/status'],
    queryFn: checkAuthStatus,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-slate flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/videos">
        {authStatus?.authenticated ? <Layout><Videos /></Layout> : <Login />}
      </Route>
      <Route path="/folders">
        {authStatus?.authenticated ? <Layout><Folders /></Layout> : <Login />}
      </Route>
      <Route path="/analytics">
        {authStatus?.authenticated ? <Layout><Analytics /></Layout> : <Login />}
      </Route>
      <Route path="/settings">
        {authStatus?.authenticated ? <Layout><Settings /></Layout> : <Login />}
      </Route>
      <Route path="/">
        {authStatus?.authenticated ? <Layout><Dashboard /></Layout> : <Login />}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-dark-slate text-light-slate">
          <Toaster />
          <AuthWrapper />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
