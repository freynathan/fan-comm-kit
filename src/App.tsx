// Router — all app routes including /admin redirect and site builder
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
import DashboardContent from "./pages/DashboardContent.tsx";
import Feed from "./pages/Feed.tsx";
import PublicClub from "./pages/PublicClub.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import AdminFanClubs from "./pages/AdminFanClubs.tsx";
import AdminFanClubForm from "./pages/AdminFanClubForm.tsx";
import NetworkAdmin from "./pages/NetworkAdmin.tsx";
import SiteFeeds from "./pages/SiteFeeds.tsx";
import AdminNetworkIndex from "./pages/AdminNetworkIndex.tsx";
import AdminNetworkSite from "./pages/AdminNetworkSite.tsx";
import AdminNetworkSitePage from "./pages/AdminNetworkSitePage.tsx";
import AdminNetworkFeeds from "./pages/AdminNetworkFeeds.tsx";
import AdminNetworkStrategy from "./pages/AdminNetworkStrategy.tsx";
import NotFound from "./pages/NotFound.tsx";
import { ArticleDrawerProvider } from "@/components/article";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ArticleDrawerProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/of/:username" element={<ProfilePage />} />
              <Route path="/c/:slug" element={<PublicClub />} />
              <Route path="/profile/edit" element={<ProfileEdit />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/clubs" element={<DashboardClubs />} />
              <Route path="/dashboard/clubs/new" element={<DashboardClubNew />} />
              <Route path="/dashboard/fans" element={<DashboardFans />} />
              <Route path="/dashboard/content" element={<DashboardContent />} />
              <Route path="/admin" element={<DashboardContent />} />
              <Route path="/admin/fan-clubs" element={<AdminFanClubs />} />
              <Route path="/admin/fan-clubs/new" element={<AdminFanClubForm />} />
              <Route path="/admin/fan-clubs/:id" element={<AdminFanClubForm />} />
              <Route path="/admin/content" element={<DashboardContent />} />
              <Route path="/admin/network" element={<AdminNetworkIndex />} />
              <Route path="/admin/network/sites/:slug" element={<AdminNetworkSite />} />
              <Route path="/admin/network/sites/:slug/pages/:pageSlug" element={<AdminNetworkSitePage />} />
              <Route path="/admin/network/feeds" element={<AdminNetworkFeeds />} />
              <Route path="/admin/network/strategy" element={<AdminNetworkStrategy />} />
              <Route path="/admin/network/sites/:slug/feeds" element={<SiteFeeds />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ArticleDrawerProvider>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
