import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { fontFamily, textVariants, type TextVariant } from '../tokens/typography';
import { useDirection } from './DirectionProvider';
import { useTheme } from './ThemeProvider';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  /** Use the muted text color. */
  muted?: boolean;
  /** Override color with a raw value. */
  color?: string;
  /** Render with the Quran (Arabic) font and RTL alignment. */
  quran?: boolean;
}

export function Text({ variant = 'body', muted, color, quran, style, ...rest }: TextProps) {
  const theme = useTheme();
  const dir = useDirection();
  const base = textVariants[variant];

  // UI text follows the active direction so headings, titles, and subtitles
  // align to the leading edge in RTL languages. An explicit `textAlign` in
  // `style` still wins (it's merged after this), so centered text is unaffected.
  const resolved: TextStyle = {
    ...base,
    color: color ?? (muted ? theme.colors.textMuted : theme.colors.text),
    ...(quran
      ? { fontFamily: fontFamily.quran, writingDirection: 'rtl', textAlign: 'right' }
      : {
          fontFamily: fontFamily.sans,
          writingDirection: dir,
          textAlign: dir === 'rtl' ? 'right' : 'left',
        }),
  };

  return <RNText style={[resolved, style]} {...rest} />;
}
