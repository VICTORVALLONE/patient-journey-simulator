/**
 * Modo demo: a trava que separa **o MVP que o médico recebe** das ferramentas
 * de teste do operador, dentro de um único build e um único link.
 *
 * Travado, o app é o produto: cadastro do zero, nenhum dado de mockup, nenhuma
 * porta de fuga visível. Destravado (abrindo `/demo`), aparecem o atalho do
 * paciente-demo no `/welcome` e a seção Demo do `/profile`.
 *
 * ## Por que uma chave própria, e não um campo da store
 *
 * A trava é propriedade do **navegador do operador**, não do prontuário. Quando
 * o dado do paciente migrar para o Supabase próprio (gate LGPD, DECISÃO #3), um
 * campo desses dentro do prontuário ou viajaria para o servidor ou viraria
 * exceção na migração. Fora da store também significa **sem bump de versão** do
 * persist, e sobreviver de graça a `resetToDemo`/`startFreshSignup`.
 *
 * ## Leitura preguiçosa, nunca em escopo de módulo
 *
 * O módulo é importado no servidor (SSR do `dev`) e nos testes, onde não há
 * `localStorage`. Ler no import quebraria os dois.
 */
const DEMO_MODE_KEY = "fisioapp-demo-mode-v1";
const UNLOCKED = "1";

function storage(): Storage | null {
  try {
    return typeof globalThis.localStorage === "undefined" ? null : globalThis.localStorage;
  } catch {
    // Safari em modo privado lança ao só tocar em localStorage.
    return null;
  }
}

/**
 * Leitura **síncrona**, para `beforeLoad`. Qualquer valor que não seja a marca
 * exata conta como travado: falhar para o lado do produto, nunca para o lado
 * das ferramentas internas.
 *
 * Não use isto durante o render — ver `useDemoMode`.
 */
export function isDemoUnlocked(): boolean {
  try {
    return storage()?.getItem(DEMO_MODE_KEY) === UNLOCKED;
  } catch {
    return false;
  }
}

export function unlockDemo(): void {
  try {
    storage()?.setItem(DEMO_MODE_KEY, UNLOCKED);
  } catch {
    /* sem storage, o modo demo simplesmente não persiste */
  }
}

export function lockDemo(): void {
  try {
    storage()?.removeItem(DEMO_MODE_KEY);
  } catch {
    /* idem */
  }
}
