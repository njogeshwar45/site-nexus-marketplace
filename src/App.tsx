import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import LandingPage from "./pages/LandingPage";
import MarketplacePage from "./pages/MarketplacePage";
import WebsiteDetailPage from "./pages/WebsiteDetailPage";
import RequestDeployPage from "./pages/RequestDeployPage";
import RequestBuildPage from "./pages/RequestBuildPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import ListingsPage from "./pages/admin/ListingsPage";
import BuyRequestsPage from "./pages/admin/BuyRequestsPage";
import DeployRequestsPage from "./pages/admin/DeployRequestsPage";
import BuildRequestsPage from "./pages/admin/BuildRequestsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/website/:id" element={<WebsiteDetailPage />} />
            <Route path="/request-deploy" element={<RequestDeployPage />} />
            <Route path="/request-build" element={<RequestBuildPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="listings" element={<ListingsPage />} />
              <Route path="buy-requests" element={<BuyRequestsPage />} />
              <Route path="deploy-requests" element={<DeployRequestsPage />} />
              <Route path="build-requests" element={<BuildRequestsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
