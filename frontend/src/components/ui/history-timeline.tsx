import type { ReimbursementHistoryEntry } from "@/types";

interface HistoryTimelineProps {
  entries: ReimbursementHistoryEntry[];
}

export function HistoryTimeline({ entries }: HistoryTimelineProps) {
  if (!entries || entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum histórico disponível</p>;
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <div key={entry.id} className="flex gap-4">
          {/* Timeline dot and line */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-primary mt-1" />
            {index < entries.length - 1 && (
              <div className="w-0.5 h-12 bg-border my-2" />
            )}
          </div>

          {/* Content */}
          <div className="pb-4 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{entry.acao}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.criadoEm).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
            {entry.observacao && (
              <p className="text-sm text-muted-foreground mt-1">{entry.observacao}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
