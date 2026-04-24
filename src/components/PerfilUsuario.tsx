import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../supabase/client";
import { useAuth } from "./AuthProvider";
import { GlassCard } from "./ui/GlassCard";
import { GlassInput } from "./ui/GlassInput";
import { GlassButton } from "./ui/GlassButton";

export const PerfilUsuario: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(
    profile?.nombre_completo || profile?.full_name || user?.user_metadata?.full_name || "",
  );
  const [phone, setPhone] = useState(profile?.telefono || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const avatarUrl = useMemo(
    () => profile?.preferencias_dashboard?.avatar_url || null,
    [profile],
  );

  const initials = useMemo(() => {
    const source = (fullName || user?.email || "USUARIO").trim();
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "SA";
  }, [fullName, user?.email]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `profiles/${user.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const currentPrefs = profile?.preferencias_dashboard || {};

      const { error: profileError } = await (supabase.from("perfiles_usuario") as any)
        .update({ preferencias_dashboard: { ...currentPrefs, avatar_url: data.publicUrl } })
        .eq("id", user.id);

      if (profileError) throw profileError;
      
      await refreshProfile();
      toast.success("Foto de perfil actualizada.");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo actualizar la foto de perfil.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const trimmedName = fullName.trim();
      const trimmedPhone = phone.trim();

      const { error: profileError } = await (supabase.from("perfiles_usuario") as any)
        .update({
          nombre_completo: trimmedName || null,
          telefono: trimmedPhone || null,
        })
        .eq("id", user.id);
      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: trimmedName || null,
        },
      });
      if (authError) throw authError;

      toast.success("Perfil actualizado. Recarga la vista para sincronizar todo el sistema.");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold text-[var(--sase-text-head)] mb-2 tracking-tight">Mi Perfil</h1>
        <p className="text-[var(--sase-text-muted)] font-medium tracking-tight">Actualiza tu foto y tus datos visibles para que SASE te nombre correctamente en toda la interfaz.</p>
      </div>

      <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-8">
        <GlassCard className="p-8 flex flex-col items-center text-center gap-5">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Foto de perfil" className="w-32 h-32 rounded-[2rem] object-cover border border-white/10 shadow-2xl" />
          ) : (
            <div className="w-32 h-32 rounded-[2rem] bg-[rgba(121,118,124,0.18)] border border-white/10 flex items-center justify-center text-4xl font-black text-white shadow-2xl">
              {initials}
            </div>
          )}

          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">{fullName || "Usuario SASE"}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--sase-text-muted)] mt-1">{profile?.rol || profile?.role || "Sin rol"}</p>
          </div>

          <label className="w-full">
            <span className="sr-only">Subir foto</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <div className="w-full py-3 rounded-2xl border border-white/10 bg-white/5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-200 cursor-pointer hover:bg-white/10 transition-all">
              {uploading ? "Subiendo foto..." : "Cambiar foto"}
            </div>
          </label>
        </GlassCard>

        <GlassCard className="p-8 space-y-6">
          <GlassInput
            label="Nombre visible"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon="badge"
            placeholder="Tu nombre completo"
          />

          <GlassInput
            label="Correo institucional"
            value={user?.email || ""}
            onChange={() => {}}
            icon="alternate_email"
            disabled
          />

          <GlassInput
            label="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon="call"
            placeholder="55 0000 0000"
          />

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-[var(--sase-text-muted)] leading-relaxed">
            El rol institucional y los permisos del ecosistema siguen controlados por SASE. Aquí solo editas tus datos de presentación y contacto.
          </div>

          <GlassButton onClick={handleSave} loading={saving} className="w-full" size="lg">
            Guardar perfil
          </GlassButton>
        </GlassCard>
      </div>
    </div>
  );
};

export default PerfilUsuario;
