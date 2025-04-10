import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import MainLayout from "./components/layout/MainLayout";
import { useAuth } from "./contexts/AuthContext";

// Lazy load pages for better performance
const Home = lazy(() => import("@/pages/Home"));
const CoinTossPage = lazy(() => import("@/pages/CoinTossPage"));
const SattamatkaPage = lazy(() => import("@/pages/SattamatkaPage"));
const WalletPage = lazy(() => import("@/pages/WalletPage"));
const Profile = lazy(() => import("@/pages/Profile"));
const AdminPanel = lazy(() => import("@/pages/admin/AdminPanel"));

function LoadingSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-accent" />
    </div>
  );
}

function ProtectedRoute({ children, admin = false }: { children: React.ReactNode, admin?: boolean }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    // Redirect to home if not logged in
    window.location.href = '/';
    return null;
  }
  
  if (admin && !user.isAdmin) {
    // Redirect to home if not admin
    window.location.href = '/';
    return null;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <MainLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Home />
          </Suspense>
        </MainLayout>
      </Route>
      
      <Route path="/coin-toss">
        <MainLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <CoinTossPage />
          </Suspense>
        </MainLayout>
      </Route>
      
      <Route path="/sattamatka">
        <MainLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <SattamatkaPage />
          </Suspense>
        </MainLayout>
      </Route>
      
      <Route path="/wallet">
        <MainLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          </Suspense>
        </MainLayout>
      </Route>
      
      <Route path="/profile">
        <MainLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Suspense>
        </MainLayout>
      </Route>
      
      <Route path="/admin">
        <MainLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute admin={true}>
              <AdminPanel />
            </ProtectedRoute>
          </Suspense>
        </MainLayout>
      </Route>
      
      {/* Fallback to 404 */}
      <Route>
        <MainLayout>
          <NotFound />
        </MainLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;
