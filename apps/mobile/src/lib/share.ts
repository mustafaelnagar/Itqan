/**
 * Copy / share an ayah (MUS-009).
 */
import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export interface ShareableAyah {
  surahName: string;
  surah: number;
  ayah: number;
  text: string;
  translation?: string | null;
}

function formatAyah(a: ShareableAyah): string {
  const ref = `— ${a.surahName} ${a.surah}:${a.ayah}`;
  return a.translation ? `${a.text}\n\n${a.translation}\n${ref}` : `${a.text}\n${ref}`;
}

export async function copyAyah(a: ShareableAyah): Promise<void> {
  await Clipboard.setStringAsync(formatAyah(a));
}

export async function shareAyah(a: ShareableAyah): Promise<void> {
  await Share.share({ message: formatAyah(a) });
}
