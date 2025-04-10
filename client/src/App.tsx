import { Switch, Route } from "wouter";
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
import AdminMarkets from "@/pages/admin/markets";
import { useAuth } from "./context/auth-context";

function Router() {
  const { user } = useAuth();
  
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/coin-toss" component={CoinToss} />
        <Route path="/sattamatka" component={Sattamatka} />
        <Route path="/team-matches" component={TeamMatches} />
        <Route path="/team-match/:id" component={TeamMatchDetails} />
        <Route path="/market/:id" component={MarketDetails} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/bet-history" component={BetHistory} />
        {user?.isAdmin && <Route path="/admin/markets" component={AdminMarkets} />}
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
