import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import Header from "./Header";
import { SidebarProvider } from "@/components/ui/sidebar";

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout; 