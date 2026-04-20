import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import ProfileEdit from "./pages/ProfileEdit.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import DashboardClubs from "./pages/DashboardClubs.tsx";
import DashboardClubNew from "./pages/DashboardClubNew.tsx";
import DashboardFans from "./pages/DashboardFans.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/of/:username" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/clubs" element={<DashboardClubs />} />
            <Route path="/dashboard/clubs/new" element={<DashboardClubNew />} />
            <Route path="/dashboard/fans" element={<DashboardFans />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
