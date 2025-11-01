import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, Sparkles, Phone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Auth = () => {
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+55");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (loginMethod === "email") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: "Erro ao criar conta",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Conta criada com sucesso!",
          description: "Você já pode fazer login.",
        });
      }
    } else {
      // Phone signup with OTP
      if (!otpSent) {
        const fullPhone = `${countryCode}${phone}`;
        const { error } = await supabase.auth.signInWithOtp({
          phone: fullPhone,
        });

        if (error) {
          toast({
            title: "Erro ao enviar código",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setOtpSent(true);
          toast({
            title: "Código enviado!",
            description: "Verifique seu SMS e insira o código para criar sua conta.",
          });
        }
      } else {
        // Verify OTP and create account
        const fullPhone = `${countryCode}${phone}`;
        const { error } = await supabase.auth.verifyOtp({
          phone: fullPhone,
          token: otp,
          type: 'sms',
        });

        if (error) {
          toast({
            title: "Erro ao verificar código",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Conta criada com sucesso!",
            description: "Bem-vindo ao Time Up Flow!",
          });
          navigate("/");
        }
      }
    }

    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (loginMethod === "email") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta.",
        });
        navigate("/");
      }
    } else {
      // Phone login with OTP
      if (!otpSent) {
        const fullPhone = `${countryCode}${phone}`;
        const { error } = await supabase.auth.signInWithOtp({
          phone: fullPhone,
        });

        if (error) {
          toast({
            title: "Erro ao enviar código",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setOtpSent(true);
          toast({
            title: "Código enviado!",
            description: "Verifique seu SMS.",
          });
        }
      } else {
        // Verify OTP
        const fullPhone = `${countryCode}${phone}`;
        const { error } = await supabase.auth.verifyOtp({
          phone: fullPhone,
          token: otp,
          type: 'sms',
        });

        if (error) {
          toast({
            title: "Erro ao verificar código",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login realizado!",
            description: "Bem-vindo de volta.",
          });
          navigate("/");
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 shadow-primary">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Time Up Flow
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Sua plataforma completa de produtividade
          </p>
        </div>

        <Card className="shadow-2xl border-primary/10 backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Acesse sua conta</CardTitle>
            <CardDescription className="text-base">
              Entre com suas credenciais ou crie uma nova conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 h-auto">
                <TabsTrigger value="signin" className="text-sm py-2.5">Entrar</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm py-2.5">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Método de Login</Label>
                    <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as "email" | "phone")} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="email" className="text-xs sm:text-sm">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Email
                        </TabsTrigger>
                        <TabsTrigger value="phone" className="text-xs sm:text-sm">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Telefone
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {loginMethod === "email" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email-signin">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email-signin"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password-signin">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password-signin"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="phone-signin">Telefone</Label>
                        <div className="flex gap-2">
                          <Select value={countryCode} onValueChange={setCountryCode}>
                            <SelectTrigger className="w-[100px] bg-card">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card z-50">
                              <SelectItem value="+55">🇧🇷 +55</SelectItem>
                              <SelectItem value="+1">🇺🇸 +1</SelectItem>
                              <SelectItem value="+351">🇵🇹 +351</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone-signin"
                              type="tel"
                              placeholder="11987654321"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Digite apenas números, sem espaços ou traços
                        </p>
                      </div>

                      {otpSent && (
                        <div className="space-y-2">
                          <Label htmlFor="otp-signin">Código de Verificação</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="otp-signin"
                              type="text"
                              placeholder="123456"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                              className="pl-10"
                              maxLength={6}
                              required
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Digite o código enviado por SMS
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Processando..." : otpSent ? "Verificar Código" : "Entrar"}
                  </Button>

                  {otpSent && loginMethod === "phone" && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                      }}
                    >
                      Voltar
                    </Button>
                  )}
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Método de Cadastro</Label>
                    <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as "email" | "phone")} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="email" className="text-xs sm:text-sm">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Email
                        </TabsTrigger>
                        <TabsTrigger value="phone" className="text-xs sm:text-sm">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Telefone
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {loginMethod === "email" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email-signup">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email-signup"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password-signup">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password-signup"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            required
                            minLength={6}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Mínimo de 6 caracteres
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="phone-signup">Telefone</Label>
                        <div className="flex gap-2">
                          <Select value={countryCode} onValueChange={setCountryCode}>
                            <SelectTrigger className="w-[100px] bg-card">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card z-50">
                              <SelectItem value="+55">🇧🇷 +55</SelectItem>
                              <SelectItem value="+1">🇺🇸 +1</SelectItem>
                              <SelectItem value="+351">🇵🇹 +351</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone-signup"
                              type="tel"
                              placeholder="11987654321"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Digite apenas números, sem espaços ou traços
                        </p>
                      </div>

                      {otpSent && (
                        <div className="space-y-2">
                          <Label htmlFor="otp-signup">Código de Verificação</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="otp-signup"
                              type="text"
                              placeholder="123456"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                              className="pl-10"
                              maxLength={6}
                              required
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Digite o código enviado por SMS
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Processando..." : otpSent ? "Verificar e Criar Conta" : "Criar conta"}
                  </Button>

                  {otpSent && loginMethod === "phone" && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                      }}
                    >
                      Voltar
                    </Button>
                  )}
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
