import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  GitPullRequest,
  Settings,
  FolderGit2,
  BarChart3,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { PremiumAvatar } from "@/components/ui/premium-avatar";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { clearCsrfToken, getCsrfToken } from "@/lib/csrf";

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Reviews",
    url: "/reviews",
    icon: GitPullRequest,
  },
  {
    title: "Repositories",
    url: "/repositories",
    icon: FolderGit2,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await getCsrfToken();
      await apiRequest("POST", "/api/logout");
    } catch {
      // still clear client state
    } finally {
      clearCsrfToken();
      window.location.href = "/auth";
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center">
            <img
              src="/logo.png"
              alt="CodeGuard logo"
              className="h-9 w-9 object-contain rounded-md"
            />
          </div>



          <div className="flex flex-col">
            <span className="text-base font-semibold">CodeGuard</span>
            <span className="text-xs text-muted-foreground">signal over noise</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url ||
                  (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} data-testid={`nav-${item.title.toLowerCase()}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>About</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/terms"}>
                  <Link href="/terms">
                    <span>Terms & Conditions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/privacy"}>
                  <Link href="/privacy">
                    <span>Privacy Policy</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/developer"}>
                  <Link href="/developer">
                    <span>Developer</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/changelog"}>
                  <Link href="/changelog">
                    <span>Channel Log</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        {user && (
          <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-accent/30 border border-white/5 shadow-inner">
            <PremiumAvatar
              name={user.username}
              tier="premium"
              size="md"
              accentColor="hsl(var(--primary))"
            />
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold truncate">{user.username}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">User</span>
            </div>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
          <Badge variant="outline" className="text-xs">v1.0.0</Badge>
          <span>CodeGuard</span>
        </div>
      </SidebarFooter>
    </Sidebar >
  );
}
