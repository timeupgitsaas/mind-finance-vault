import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, detectBrowserLanguage } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("pt");

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Try to load from database
      const { data } = await supabase
        .from("user_preferences")
        .select("language")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data?.language) {
        setLanguageState(data.language as Language);
      } else {
        // Auto-detect and save
        const detected = detectBrowserLanguage();
        setLanguageState(detected);
        await saveLanguagePreference(detected);
      }
    } else {
      // Not logged in, just detect
      const detected = detectBrowserLanguage();
      setLanguageState(detected);
    }
  };

  const saveLanguagePreference = async (lang: Language) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        language: lang,
      });
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await saveLanguagePreference(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};