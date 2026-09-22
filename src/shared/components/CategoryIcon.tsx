import { StyleSheet, View } from 'react-native';

export type CategoryIconKind =
  | 'wifi'
  | 'key'
  | 'code'
  | 'phone'
  | 'device'
  | 'note'
  | 'backup';

export interface CategoryIconProps {
  kind: CategoryIconKind;
  size: number;
  color: string;
}

export function CategoryIcon({ kind, size, color }: CategoryIconProps) {
  return (
    <View testID={`category-icon-${kind}`}>
      {ICON_BY_KIND[kind]({ size, color })}
    </View>
  );
}

interface IconGlyphProps {
  size: number;
  color: string;
}

function WifiGlyph({ size, color }: IconGlyphProps) {
  const barWidth = size / 5;
  const gap = size / 6;
  const heights = [size * 0.4, size * 0.65, size * 0.9];
  return (
    <View style={[styles.row, styles.alignEnd, { gap }]}>
      {heights.map((height, index) => (
        <View
          key={index}
          style={{
            width: barWidth,
            height,
            borderRadius: barWidth / 2,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

function KeyGlyph({ size, color }: IconGlyphProps) {
  const stroke = Math.max(1.5, size * 0.14);
  const ringSize = size * 0.5;
  const shaftLength = size * 0.5;
  return (
    <View style={[styles.row, styles.alignCenter]}>
      <View
        style={{
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          borderWidth: stroke,
          borderColor: color,
        }}
      />
      <View
        style={{ width: shaftLength, height: stroke, backgroundColor: color }}
      />
      <View
        style={{
          width: stroke,
          height: stroke * 2,
          backgroundColor: color,
          marginLeft: -stroke,
        }}
      />
    </View>
  );
}

function CodeGlyph({ size, color }: IconGlyphProps) {
  const dotSize = size * 0.16;
  const gap = size * 0.14;
  return (
    <View style={{ gap }}>
      {[0, 1].map(row => (
        <View key={row} style={[styles.row, { gap }]}>
          {[0, 1, 2].map(column => (
            <View
              key={column}
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: color,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function PhoneGlyph({ size, color }: IconGlyphProps) {
  const stroke = Math.max(1.5, size * 0.12);
  const width = size * 0.5;
  const height = size * 0.85;
  return (
    <View
      style={[
        styles.alignCenter,
        styles.justifyEnd,
        {
          width,
          height,
          borderRadius: width * 0.3,
          borderWidth: stroke,
          borderColor: color,
          paddingBottom: height * 0.12,
        },
      ]}
    >
      <View
        style={{
          width: width * 0.35,
          height: stroke * 0.8,
          borderRadius: stroke,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

function DeviceGlyph({ size, color }: IconGlyphProps) {
  const stroke = Math.max(1.5, size * 0.1);
  const screenWidth = size * 0.85;
  const screenHeight = size * 0.55;
  return (
    <View style={styles.alignCenter}>
      <View
        style={{
          width: screenWidth,
          height: screenHeight,
          borderRadius: size * 0.08,
          borderWidth: stroke,
          borderColor: color,
        }}
      />
      <View
        style={{
          width: screenWidth * 0.4,
          height: stroke,
          backgroundColor: color,
          marginTop: size * 0.08,
        }}
      />
    </View>
  );
}

function NoteGlyph({ size, color }: IconGlyphProps) {
  const stroke = Math.max(1.5, size * 0.1);
  const width = size * 0.7;
  const height = size * 0.85;
  const lineHeight = Math.max(1, size * 0.08);
  return (
    <View
      style={[
        styles.justifyCenter,
        {
          width,
          height,
          borderRadius: size * 0.08,
          borderWidth: stroke,
          borderColor: color,
          gap: size * 0.12,
          paddingHorizontal: width * 0.15,
        },
      ]}
    >
      {[0, 1, 2].map(index => (
        <View
          key={index}
          style={{
            height: lineHeight,
            borderRadius: lineHeight / 2,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

function BackupGlyph({ size, color }: IconGlyphProps) {
  const stroke = Math.max(1.5, size * 0.14);
  const triangleSize = size * 0.22;
  return (
    <View style={styles.alignCenter}>
      <View
        style={{ width: stroke, height: size * 0.35, backgroundColor: color }}
      />
      <View
        style={[
          styles.triangle,
          {
            borderLeftWidth: triangleSize,
            borderRightWidth: triangleSize,
            borderTopWidth: triangleSize,
            borderTopColor: color,
            marginTop: -stroke * 0.5,
          },
        ]}
      />
      <View
        style={{
          width: size * 0.75,
          height: stroke,
          borderRadius: stroke / 2,
          backgroundColor: color,
          marginTop: size * 0.18,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

const ICON_BY_KIND: Record<
  CategoryIconKind,
  (props: IconGlyphProps) => React.JSX.Element
> = {
  wifi: WifiGlyph,
  key: KeyGlyph,
  code: CodeGlyph,
  phone: PhoneGlyph,
  device: DeviceGlyph,
  note: NoteGlyph,
  backup: BackupGlyph,
};
