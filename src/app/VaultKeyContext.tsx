import { createContext, useContext, type ReactNode } from 'react';

const VaultKeyContext = createContext<Buffer | null>(null);

export function VaultKeyProvider({
  vaultKey,
  children,
}: {
  vaultKey: Buffer;
  children: ReactNode;
}) {
  return (
    <VaultKeyContext.Provider value={vaultKey}>
      {children}
    </VaultKeyContext.Provider>
  );
}

export function useVaultKey(): Buffer {
  const vaultKey = useContext(VaultKeyContext);
  if (vaultKey === null) {
    throw new Error('useVaultKey() must be called within a VaultKeyProvider');
  }
  return vaultKey;
}
