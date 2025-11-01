import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { User, Mail, Phone, Globe, Award, Upload, Loader2 } from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
}

export default function Settings() {
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    full_name: "",
    email: "",
    phone: "",
    avatar_url: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setProfile({
        id: user.id,
        full_name: user.user_metadata?.full_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        avatar_url: user.user_metadata?.avatar_url || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
        }
      });

      if (error) throw error;

      toast({
        title: language === "pt" ? "✅ Perfil atualizado!" : "✅ Profile updated!",
        description: language === "pt" 
          ? "Suas informações foram salvas com sucesso." 
          : "Your information has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: language === "pt" ? "Erro ao salvar" : "Error saving",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: language === "pt" ? "Arquivo muito grande" : "File too large",
        description: language === "pt" 
          ? "A imagem deve ter no máximo 2MB." 
          : "Image must be at most 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Convert to base64 for user metadata (simpler approach)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        const { error } = await supabase.auth.updateUser({
          data: { avatar_url: base64 }
        });

        if (error) throw error;

        setProfile({ ...profile, avatar_url: base64 });
        toast({
          title: language === "pt" ? "✅ Foto atualizada!" : "✅ Photo updated!",
          description: language === "pt"
            ? "Sua foto de perfil foi atualizada."
            : "Your profile photo has been updated.",
        });
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({
        title: language === "pt" ? "Erro ao fazer upload" : "Upload error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            {t("settings")}
          </h1>
          <p className="text-muted-foreground">
            {language === "pt" 
              ? "Gerencie suas informações pessoais e preferências" 
              : "Manage your personal information and preferences"}
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {language === "pt" ? "Foto de Perfil" : "Profile Picture"}
              </CardTitle>
              <CardDescription>
                {language === "pt" 
                  ? "Adicione ou altere sua foto de perfil" 
                  : "Add or change your profile picture"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("avatar-upload")?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === "pt" ? "Enviando..." : "Uploading..."}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {language === "pt" ? "Alterar Foto" : "Change Photo"}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  {language === "pt" 
                    ? "JPG, PNG ou GIF. Máximo 2MB." 
                    : "JPG, PNG or GIF. Maximum 2MB."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {language === "pt" ? "Informações Pessoais" : "Personal Information"}
              </CardTitle>
              <CardDescription>
                {language === "pt" 
                  ? "Atualize seus dados pessoais" 
                  : "Update your personal details"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {language === "pt" ? "Nome Completo" : "Full Name"}
                </Label>
                <Input
                  id="name"
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder={language === "pt" ? "Seu nome completo" : "Your full name"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  {language === "pt" 
                    ? "O email não pode ser alterado por questões de segurança" 
                    : "Email cannot be changed for security reasons"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {language === "pt" ? "Telefone" : "Phone"}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder={language === "pt" ? "+55 (11) 98765-4321" : "+1 (555) 123-4567"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t("language")}
              </CardTitle>
              <CardDescription>
                {language === "pt" 
                  ? "Escolha o idioma do sistema" 
                  : "Choose the system language"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={language} onValueChange={(value: "pt" | "en") => setLanguage(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">🇧🇷 Português</SelectItem>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Bonus Status (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                {language === "pt" ? "Status de Bônus" : "Bonus Status"}
              </CardTitle>
              <CardDescription>
                {language === "pt" 
                  ? "Acompanhe seus pontos e recompensas" 
                  : "Track your points and rewards"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === "pt" ? "Seus Pontos de Bônus" : "Your Bonus Points"}
                    </p>
                    <p className="text-4xl font-bold text-primary mt-1">0</p>
                  </div>
                  <Award className="w-16 h-16 text-primary/20" />
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  {language === "pt" 
                    ? "🎉 Sistema de bônus em desenvolvimento. Em breve você poderá ganhar pontos por suas atividades!" 
                    : "🎉 Bonus system under development. Soon you'll be able to earn points for your activities!"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={loadProfile}>
              {language === "pt" ? "Cancelar" : "Cancel"}
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === "pt" ? "Salvando..." : "Saving..."}
                </>
              ) : (
                <>
                  {t("save")}
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
