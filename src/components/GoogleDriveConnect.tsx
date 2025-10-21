import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudOff, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function GoogleDriveConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("google_tokens")
      .select("google_email")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setIsConnected(true);
      setGoogleEmail(data.google_email);
    }
  };

  const connectGoogle = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-auth", {
        body: { action: "authorize" },
      });

      if (error) throw error;

      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error: any) {
      toast({
        title: "Erro ao conectar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectGoogle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("google_tokens")
      .delete()
      .eq("user_id", user.id);

    if (!error) {
      setIsConnected(false);
      setGoogleEmail(null);
      toast({
        title: "Desconectado",
        description: "Conta Google desconectada com sucesso",
      });
    }
  };

  const exportToSheets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-sheets-export");

      if (error) throw error;

      toast({
        title: "Exportação concluída",
        description: "Dados exportados para o Google Sheets",
      });
    } catch (error: any) {
      toast({
        title: "Erro na exportação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const backupToDrive = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-drive-backup");

      if (error) throw error;

      toast({
        title: "Backup realizado",
        description: "Dados salvos no Google Drive",
      });
    } catch (error: any) {
      toast({
        title: "Erro no backup",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Integração Google
        </CardTitle>
        <CardDescription>
          Conecte sua conta Google para backup e exportação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
              <div>
                <p className="text-sm font-medium">Conectado como</p>
                <p className="text-xs text-muted-foreground">{googleEmail}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnectGoogle}
              >
                <CloudOff className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                onClick={exportToSheets}
                disabled={loading}
                variant="outline"
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Exportar para Sheets
              </Button>
              <Button
                onClick={backupToDrive}
                disabled={loading}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Backup no Drive
              </Button>
            </div>
          </>
        ) : (
          <Button
            onClick={connectGoogle}
            disabled={loading}
            className="w-full gap-2"
          >
            <Cloud className="w-4 h-4" />
            Conectar ao Google Drive
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
