import type { User } from "@/lib/types";

/**
 * O usuário com que o app nasce: **em branco, não o Alexandre**.
 *
 * A store mantém `user` sempre presente de propósito — o alternativo, `user:
 * null`, cobraria early-return em sete telas para um caso que nunca acontece
 * (`entryStage` só devolve `ready` depois de `completePersonalOnboarding`
 * gravar um `User` completo). O problema nunca foi "o usuário pode não
 * existir"; era "o usuário é de outra pessoa".
 *
 * Sem `phone`, `email` nem `avatar_url`: o cadastro não pede nenhum dos três, e
 * inventá-los aqui recriaria exatamente o vazamento que este arquivo existe
 * para fechar.
 */
export const EMPTY_USER: User = {
  id: "",
  name: "",
  birth_date: "",
  weight_kg: 0,
  height_cm: 0,
  recovery_goal: "daily_life",
  created_at: "",
};

/** Ninguém preencheu o cadastro ainda. */
export function isBlankUser(user: User): boolean {
  return !user.id && !user.name;
}

/**
 * Primeiro nome, para vocativo. Devolve `null` quando não há nome — a chamada
 * decide o texto neutro, porque "Bom dia, " e "Tudo pronto, ." são piores que
 * qualquer alternativa.
 */
export function firstName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

/** Inicial para o avatar. Fallback silencioso — círculo vazio parece defeito. */
export function avatarInitial(name: string): string {
  return firstName(name)?.charAt(0).toUpperCase() ?? "?";
}

/**
 * Idade em anos, ou `null` se a data não serve. Sem isso, `new Date("")` do
 * usuário em branco vira `NaN anos` no perfil e no PDF que vai ao médico.
 */
export function ageFromBirthDate(birthDate: string, today: Date = new Date()): number | null {
  if (!birthDate) return null;
  const born = new Date(birthDate);
  if (Number.isNaN(born.getTime())) return null;
  let age = today.getFullYear() - born.getFullYear();
  const monthDiff = today.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getDate())) age--;
  return age >= 0 ? age : null;
}
