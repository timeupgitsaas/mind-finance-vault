import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useStatistics = (module: string) => {
  const startTimeRef = useRef<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isTracking, setIsTracking] = useState(true);

  useEffect(() => {
    startTimeRef.current = new Date();
    
    // Salvar tempo a cada minuto
    intervalRef.current = setInterval(async () => {
      if (!isTracking) return;
      
      const now = new Date();
      const minutesSpent = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 60000);
      
      if (minutesSpent > 0) {
        await trackTime(minutesSpent);
        startTimeRef.current = now;
      }
    }, 60000); // A cada 1 minuto

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Salvar tempo final ao sair
      const now = new Date();
      const minutesSpent = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 60000);
      if (minutesSpent > 0) {
        trackTime(minutesSpent);
      }
    };
  }, [module, isTracking]);

  const trackTime = async (minutes: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const hour = new Date().getHours();

    // Upsert: atualizar se existir, inserir se não
    const { data: existing } = await supabase
      .from("user_statistics")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .eq("module", module)
      .single();

    if (existing) {
      await supabase
        .from("user_statistics")
        .update({
          time_spent_minutes: existing.time_spent_minutes + minutes,
          hour_of_day: hour,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("user_statistics").insert({
        user_id: user.id,
        date: today,
        module,
        time_spent_minutes: minutes,
        hour_of_day: hour,
      });
    }
  };

  const trackActivity = async (activity: {
    charactersWritten?: number;
    wordsWritten?: number;
    itemsCreated?: number;
    connectionsCreated?: number;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("user_statistics")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .eq("module", module)
      .single();

    if (existing) {
      const updates: any = {};
      if (activity.charactersWritten) {
        updates.characters_written = existing.characters_written + activity.charactersWritten;
      }
      if (activity.wordsWritten) {
        updates.words_written = existing.words_written + activity.wordsWritten;
      }
      if (activity.itemsCreated) {
        updates.items_created = existing.items_created + activity.itemsCreated;
      }
      if (activity.connectionsCreated) {
        updates.connections_created = existing.connections_created + activity.connectionsCreated;
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from("user_statistics")
          .update(updates)
          .eq("id", existing.id);
      }
    } else {
      await supabase.from("user_statistics").insert({
        user_id: user.id,
        date: today,
        module,
        ...activity,
      });
    }
  };

  return { trackActivity, setIsTracking };
};
