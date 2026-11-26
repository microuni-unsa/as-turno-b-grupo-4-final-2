import { useState } from "react";
import {
  ActivityIcon,
  BotIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleDotIcon,
  ClockIcon,
  CpuIcon,
  EyeIcon,
  TerminalIcon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Task,
  TaskContent,
  TaskItem,
  TaskTrigger,
} from "@/components/ai-elements/task";
import {
  Terminal,
  TerminalActions,
  TerminalContent,
  TerminalCopyButton,
  TerminalHeader,
  TerminalStatus,
  TerminalTitle,
} from "@/components/ai-elements/terminal";
import {
  Tool,
  ToolContent,
  ToolInput,
} from "@/components/ai-elements/tool";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { formatDurationMs, formatToolArgsPreview } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  AgentRunState,
  SubagentView,
  ThinkingMessagePart,
  TodoPhaseView,
  ToolCallMessagePart,
  ToolCallStatus,
} from "@/types/protocol";

interface AgentTraceViewProps {
  thinkingAndToolParts: Array<ThinkingMessagePart | ToolCallMessagePart>;
  showTraces: boolean;
  isMessageStreaming: boolean;
  todos?: TodoPhaseView[];
  subagents?: SubagentView[];
  runState?: AgentRunState;
}

function ToolStatusBadge({ status }: { status: ToolCallStatus }) {
  switch (status) {
    case "pending":
      return (
        <Badge className="gap-1 rounded-full text-[11px]" variant="secondary">
          <ClockIcon className="size-3 text-muted-foreground" />
          En cola
        </Badge>
      );
    case "running":
      return (
        <Badge
          className="gap-1 rounded-full border-amber-500/40 bg-amber-500/15 text-[11px] text-amber-600 dark:text-amber-300"
          variant="outline"
        >
          <Spinner className="size-3" />
          Ejecutando
        </Badge>
      );
    case "success":
      return (
        <Badge
          className="gap-1 rounded-full border-emerald-500/40 bg-emerald-500/15 text-[11px] text-emerald-600 dark:text-emerald-300"
          variant="outline"
        >
          <CheckCircle2Icon className="size-3" />
          Completado
        </Badge>
      );
    case "error":
      return (
        <Badge
          className="gap-1 rounded-full border-destructive/50 bg-destructive/15 text-[11px] text-destructive"
          variant="outline"
        >
          <XCircleIcon className="size-3" />
          Error
        </Badge>
      );
  }
}

function ToolCallCard({ part }: { part: ToolCallMessagePart }) {
  const argsPreview = formatToolArgsPreview(part.toolName, part.args);
  const isRunning = part.status === "running" || part.status === "pending";
  const outputText = part.output ?? "";

  return (
    <Tool
      className="mb-2 border-border/80 bg-card/60"
      defaultOpen={isRunning || part.status === "error"}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-muted/40">
        <div className="flex min-w-0 items-center gap-2">
          {part.toolName === "bash" ? (
            <TerminalIcon className="size-3.5 shrink-0 text-primary" />
          ) : (
            <WrenchIcon className="size-3.5 shrink-0 text-primary" />
          )}
          <span className="shrink-0 font-mono font-semibold text-xs">
            {part.toolName}
          </span>
          {argsPreview && (
            <span className="truncate font-mono text-muted-foreground text-xs">
              {argsPreview}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {part.durationMs !== undefined && (
            <span className="font-mono text-[11px] text-muted-foreground">
              {formatDurationMs(part.durationMs)}
            </span>
          )}
          <ToolStatusBadge status={part.status} />
          <ChevronDownIcon className="size-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>

      <ToolContent className="space-y-3 border-t p-3">
        {Object.keys(part.args).length > 0 && <ToolInput input={part.args} />}

        {(outputText.length > 0 || isRunning) && (
          <Terminal
            className="border-zinc-800/80"
            isStreaming={isRunning}
            output={outputText || (isRunning ? "Esperando salida..." : "")}
          >
            <TerminalHeader className="py-1.5">
              <TerminalTitle className="text-xs">
                Salida · {part.toolName}
              </TerminalTitle>
              <div className="flex items-center gap-2">
                <TerminalStatus className="text-[11px]">
                  <Spinner className="size-3" />
                  En vivo
                </TerminalStatus>
                <TerminalActions>
                  <TerminalCopyButton />
                </TerminalActions>
              </div>
            </TerminalHeader>
            <TerminalContent className="max-h-64 p-3 text-xs leading-relaxed" />
          </Terminal>
        )}
      </ToolContent>
    </Tool>
  );
}

export function LiveWorkProgress({
  todos,
  subagents,
}: {
  todos: TodoPhaseView[];
  subagents: SubagentView[];
}) {
  if (todos.length === 0 && subagents.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 space-y-2">
      {subagents.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {subagents.map((sub) => (
            <Badge
              className={cn(
                "gap-1.5 px-2 py-0.5 text-[11px]",
                sub.status === "running" &&
                  "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300",
                sub.status === "completed" &&
                  "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
                sub.status === "error" &&
                  "border-destructive/40 bg-destructive/10 text-destructive",
              )}
              key={sub.id}
              variant="outline"
            >
              {sub.status === "running" ? (
                <Spinner className="size-3" />
              ) : (
                <BotIcon className="size-3" />
              )}
              <span className="font-medium">{sub.name}</span>
              {sub.task && (
                <span className="max-w-44 truncate text-muted-foreground">
                  · {sub.task}
                </span>
              )}
            </Badge>
          ))}
        </div>
      )}

      {todos.length > 0 && (
        <div className="rounded-lg border border-border/80 bg-card/50 p-2.5">
          {todos.map((phase) => (
            <Task defaultOpen key={phase.id}>
              <TaskTrigger
                className="py-0.5"
                title={`${phase.name} (${phase.tasks.filter((t) => t.status === "completed").length}/${phase.tasks.length})`}
              />
              <TaskContent>
                {phase.tasks.map((task) => (
                  <TaskItem className="flex items-center gap-2 text-xs" key={task.id}>
                    {task.status === "completed" ? (
                      <CheckCircle2Icon className="size-3.5 shrink-0 text-emerald-500" />
                    ) : task.status === "in_progress" ? (
                      <Spinner className="size-3.5 shrink-0 text-amber-500" />
                    ) : task.status === "cancelled" ? (
                      <XCircleIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <CircleDotIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <span
                      className={cn(
                        task.status === "completed" && "line-through opacity-75",
                      )}
                    >
                      {task.content}
                    </span>
                  </TaskItem>
                ))}
              </TaskContent>
            </Task>
          ))}
        </div>
      )}
    </div>
  );
}

export function AgentTraceView({
  thinkingAndToolParts,
  showTraces,
  isMessageStreaming,
  todos = [],
  subagents = [],
  runState,
}: AgentTraceViewProps) {
  const [peekExpanded, setPeekExpanded] = useState(false);

  const stepCount = thinkingAndToolParts.length;
  const todoTaskCount = todos.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const displayStepCount = stepCount > 0 ? stepCount : todoTaskCount + subagents.length;
  const hasLiveWork = todos.length > 0 || subagents.length > 0;

  if (stepCount === 0 && !hasLiveWork) {
    return null;
  }

  const activeTool =
    runState?.activeToolName ??
    thinkingAndToolParts
      .filter((p): p is ToolCallMessagePart => p.type === "tool_call" && p.status === "running")
      .at(-1)?.toolName;

  if (!showTraces && !peekExpanded) {
    const unitLabel =
      stepCount > 0
        ? displayStepCount === 1
          ? "paso"
          : "pasos"
        : displayStepCount === 1
          ? "tarea"
          : "tareas";

    return (
      <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-1.5 text-xs">
        <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
          {isMessageStreaming ? (
            <>
              <ActivityIcon className="size-3.5 shrink-0 text-primary animate-pulse" />
              <Shimmer duration={1.2}>
                {activeTool
                  ? `Ejecutando ${activeTool} · ${displayStepCount} ${unitLabel}…`
                  : `Analizando evidencia PIMS · ${displayStepCount} ${unitLabel}…`}
              </Shimmer>
            </>
          ) : (
            <>
              <CpuIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <span>
                Ejecución completada ({displayStepCount} {unitLabel})
              </span>
            </>
          )}
        </div>

        <Button
          className="h-6 gap-1 px-2 text-[11px]"
          onClick={() => setPeekExpanded(true)}
          size="sm"
          type="button"
          variant="ghost"
        >
          <EyeIcon className="size-3" />
          Ver traza del agente ({displayStepCount})
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-2 space-y-2">
      {!showTraces && peekExpanded && (
        <div className="flex justify-end">
          <Button
            className="h-6 px-2 text-[11px] text-muted-foreground"
            onClick={() => setPeekExpanded(false)}
            size="sm"
            type="button"
            variant="ghost"
          >
            Ocultar traza
          </Button>
        </div>
      )}

      {hasLiveWork && <LiveWorkProgress subagents={subagents} todos={todos} />}

      {thinkingAndToolParts.map((part, idx) => {
        if (part.type === "thinking") {
          const durationSec =
            part.durationMs !== undefined ? Math.max(1, Math.round(part.durationMs / 1000)) : undefined;
          return (
            <Reasoning
              className="mb-2 rounded-lg border border-border/70 bg-card/40 px-3 py-2"
              defaultOpen={Boolean(part.isStreaming)}
              duration={durationSec}
              isStreaming={Boolean(part.isStreaming)}
              key={`thinking-${idx}`}
            >
              <ReasoningTrigger
                getThinkingMessage={(streaming, duration) =>
                  streaming ? (
                    <Shimmer duration={1.1}>Razonando sobre evidencia ISO 27701…</Shimmer>
                  ) : (
                    <span>
                      Razonamiento{duration !== undefined ? ` (${duration}s)` : ""}
                    </span>
                  )
                }
              />
              <ReasoningContent className="mt-2 text-xs leading-relaxed">
                {part.text}
              </ReasoningContent>
            </Reasoning>
          );
        }

        return <ToolCallCard key={part.id || `tool-${idx}`} part={part} />;
      })}
    </div>
  );
}
