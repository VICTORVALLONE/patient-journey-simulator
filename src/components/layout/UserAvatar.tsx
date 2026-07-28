import { avatarInitial } from "@/lib/user";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  /** Lado do círculo em px. */
  size?: number;
  className?: string;
}

/**
 * Avatar do paciente, com **iniciais como fallback**.
 *
 * Existe como componente porque a home e o perfil tinham dois fallbacks
 * diferentes — a home caía num ícone genérico, o perfil na inicial — e o
 * cadastro nunca pede foto. Ou seja: o fallback é o caminho normal, não a
 * exceção, e não pode divergir entre a primeira tela que o paciente vê e a
 * página do perfil dele.
 */
export function UserAvatar({ name, avatarUrl, size = 40, className }: UserAvatarProps) {
  const dimension = { width: size, height: size };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || "Foto do paciente"}
        loading="lazy"
        {...dimension}
        className={cn("rounded-full object-cover ring-2 ring-primary/20", className)}
        style={dimension}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-full bg-primary font-bold text-primary-foreground",
        className,
      )}
      style={{ ...dimension, fontSize: Math.round(size * 0.4) }}
    >
      {avatarInitial(name)}
    </div>
  );
}
