import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CoinToss from "@/pages/coin-toss";
import Sattamatka from "@/pages/sattamatka";
import MarketDetails from "@/pages/market-details";
import TeamMatches from "@/pages/team-matches";
import TeamMatchDetails from "@/pages/team-match-details";
import Wallet from "@/pages/wallet";
import BetHistory from "@/pages/bet-history";
import Login from "@/pages/login";

// Admin pages
import AdminMarkets from "@/pages/admin/markets";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminTransactions from "@/pages/admin/transactions";

import { useAuth } from "./context/auth-context";

// Route guard for authenticated routes
const PrivateRoute = ({ component: Component, ...rest }: any) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  return <Component {...rest} />;
};

// Route guard for admin routes
const AdminRoute = ({ component: Component, ...rest }: any) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user || !user.isAdmin) {
    return <Redirect to="/" />;
  }
  
  return <Component {...rest} />;
};

function Router() {
  const { user, isLoading } = useAuth();
  
  // While checking auth status, show a loading indicator
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // Render the login page without layout
  if (!user && window.location.pathname !== "/") {
    if (window.location.pathname === "/login") {
      return (
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="*">
            <Redirect to="/login" />
          </Route>
        </Switch>
      );
    }
    return <Redirect to="/login" />;
  }
  
  return (
    <Layout>
      <Switch>
        <Route path="/login">
          {user ? <Redirect to="/" /> : <Login />}
        </Route>
        <Route path="/" component={Home} />
        <Route path="/coin-toss" component={CoinToss} />
        <Route path="/sattamatka" component={Sattamatka} />
        <Route path="/team-matches" component={TeamMatches} />
        <Route path="/team-match/:id" component={TeamMatchDetails} />
        <Route path="/market/:id" component={MarketDetails} />
        
        {/* Protected Routes */}
        <Route path="/wallet">
          {user ? <Wallet /> : <Redirect to="/login" />}
        </Route>
        <Route path="/bet-history">
          {user ? <BetHistory /> : <Redirect to="/login" />}
        </Route>
        
        {/* Admin Routes */}
        {user?.isAdmin && (
          <>
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin/markets" component={AdminMarkets} />
            <Route path="/admin/users" component={AdminUsers} />
            <Route path="/admin/transactions" component={AdminTransactions} />
          </>
        )}
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
