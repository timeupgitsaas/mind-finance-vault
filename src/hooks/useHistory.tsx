import { useState, useCallback } from "react";

export interface HistoryAction {
  type: "create" | "update" | "delete" | "move" | "connect";
  module: "note" | "flow" | "mindmap" | "block" | "connection";
  stateBefore: any;
  stateAfter: any;
  timestamp: number;
  description: string;
}

const MAX_HISTORY = 50;

export const useHistory = () => {
  const [past, setPast] = useState<HistoryAction[]>([]);
  const [future, setFuture] = useState<HistoryAction[]>([]);

  const addAction = useCallback((action: HistoryAction) => {
    setPast((prev) => {
      const newPast = [...prev, action];
      // Limitar a 50 ações
      if (newPast.length > MAX_HISTORY) {
        return newPast.slice(-MAX_HISTORY);
      }
      return newPast;
    });
    // Limpar future quando uma nova ação é feita
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    if (past.length === 0) return null;

    const lastAction = past[past.length - 1];
    setPast((prev) => prev.slice(0, -1));
    setFuture((prev) => [lastAction, ...prev]);

    return lastAction.stateBefore;
  }, [past]);

  const redo = useCallback(() => {
    if (future.length === 0) return null;

    const nextAction = future[0];
    setFuture((prev) => prev.slice(1));
    setPast((prev) => [...prev, nextAction]);

    return nextAction.stateAfter;
  }, [future]);

  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return {
    past,
    future,
    addAction,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
  };
};
