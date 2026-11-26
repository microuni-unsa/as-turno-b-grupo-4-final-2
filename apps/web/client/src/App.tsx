import { useState } from "react";
import { ArtifactPreviewSheet } from "@/components/ArtifactPreviewSheet";
import { ChatThread } from "@/components/ChatThread";
import { FilesDrawer } from "@/components/FilesDrawer";
import { LoginGate } from "@/components/LoginGate";
import { SecretsDrawer } from "@/components/SecretsDrawer";
import { SessionSidebar } from "@/components/SessionSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TopBar } from "@/components/TopBar";
import { useAgentWebSocket } from "@/hooks/useWebSocket";

function OperatorShell() {
  const agent = useAgentWebSocket();
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-background text-foreground">
      <TopBar
        onToggleDesktopSidebar={() => setDesktopSidebarCollapsed((prev) => !prev)}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <SessionSidebar
          desktopCollapsed={desktopSidebarCollapsed}
          onNewSession={() => {
            agent.newSession();
          }}
          onSwitchSession={(sessionPath) => {
            agent.switchSession(sessionPath);
          }}
        />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ChatThread
            onAbort={agent.abortRun}
            onSendPrompt={agent.sendPrompt}
            onUiResponse={agent.sendUiResponse}
          />
        </main>
      </div>

      <FilesDrawer />
      <SecretsDrawer />
      <ArtifactPreviewSheet />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <LoginGate>
        <OperatorShell />
      </LoginGate>
    </ThemeProvider>
  );
}

export default App;
