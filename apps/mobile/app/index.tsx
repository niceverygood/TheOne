import { Text, View } from 'react-native';
import { colors, fonts } from '@theone/shared';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.ink,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Text style={{ color: colors.graySoft, fontSize: 11, letterSpacing: 2 }}>
        APPLICATION ONLY
      </Text>
      <Text style={{ color: colors.ivory, fontSize: 40, fontWeight: '700', marginTop: 16 }}>
        THE ONE
      </Text>
      <Text style={{ color: colors.champagne, fontSize: 14, marginTop: 8, fontFamily: fonts.mono }}>
        Phase 4 — mobile skeleton
      </Text>
    </View>
  );
}
