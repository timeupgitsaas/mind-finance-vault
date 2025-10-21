import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    google?: any;
  }
}

export function GoogleSignIn() {
  const [loading, setLoading] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load Google Identity Services SDK
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "YOUR_GOOGLE_CLIENT_ID", // User needs to configure this
          callback: handleCredentialResponse,
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = (response: any) => {
    setLoading(true);
    try {
      // Decode JWT token
      const userObject = JSON.parse(atob(response.credential.split(".")[1]));
      
      setGoogleUser({
        name: userObject.name,
        email: userObject.email,
        picture: userObject.picture,
        token: response.credential,
      });

      // Save to sessionStorage
      sessionStorage.setItem("google_user", JSON.stringify(userObject));
      
      toast({
        title: "Conectado com sucesso!",
        description: `Bem-vindo, ${userObject.name}`,
      });
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

  const handleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      toast({
        title: "Erro",
        description: "SDK do Google não carregado. Por favor, recarregue a página.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = () => {
    setGoogleUser(null);
    sessionStorage.removeItem("google_user");
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    toast({
      title: "Desconectado",
      description: "Você foi desconectado da conta Google.",
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Login com Google
        </CardTitle>
        <CardDescription>
          Conecte sua conta Google para backup e sincronização
        </CardDescription>
      </CardHeader>
      <CardContent>
        {googleUser ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
              {googleUser.picture && (
                <img
                  src={googleUser.picture}
                  alt={googleUser.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1">
                <p className="font-medium">{googleUser.name}</p>
                <p className="text-sm text-muted-foreground">{googleUser.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="w-full">
              Desconectar
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4" />
                Entrar com Google
              </>
            )}
          </Button>
        )}
        
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-sm">
          <p className="font-medium text-yellow-800 dark:text-yellow-200">⚙️ Configuração necessária</p>
          <p className="text-yellow-700 dark:text-yellow-300 mt-1">
            Para usar o login do Google, configure o CLIENT_ID no arquivo GoogleSignIn.tsx.
            Instruções detalhadas no README.md.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
