import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { themeMode, colors, setThemeMode, isDark } = useTheme();
  const { autoTranscribeEnabled, setAutoTranscribeEnabled, autoSummaryEnabled, setAutoSummaryEnabled } = useSettings();

  const handleThemeChange = async (mode: 'auto' | 'light' | 'dark') => {
    await setThemeMode(mode);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Theme Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Erscheinungsbild
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Auto */}
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleThemeChange('auto')}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.radio, { borderColor: colors.border }]}>
                  {themeMode === 'auto' && (
                    <View style={[styles.radioSelected, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <View>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    Automatisch
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    Folgt der Systemeinstellung
                  </Text>
                </View>
              </View>
              <Ionicons name="phone-portrait-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Light */}
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleThemeChange('light')}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.radio, { borderColor: colors.border }]}>
                  {themeMode === 'light' && (
                    <View style={[styles.radioSelected, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <View>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    Hell
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    Heller Modus
                  </Text>
                </View>
              </View>
              <Ionicons name="sunny-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Dark */}
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleThemeChange('dark')}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.radio, { borderColor: colors.border }]}>
                  {themeMode === 'dark' && (
                    <View style={[styles.radioSelected, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <View>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    Dunkel
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    Dunkler Modus
                  </Text>
                </View>
              </View>
              <Ionicons name="moon-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              KI Einstellungen
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => setAutoTranscribeEnabled(!autoTranscribeEnabled)}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: autoTranscribeEnabled ? colors.primary : 'transparent' }]}>
                  {autoTranscribeEnabled && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    Automatisches Transkribieren
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    Nach Aufnahme automatisch transkribieren
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.option}
              onPress={() => setAutoSummaryEnabled(!autoSummaryEnabled)}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: autoSummaryEnabled ? colors.primary : 'transparent' }]}>
                  {autoSummaryEnabled && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    Automatische Zusammenfassung
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    Erstellt automatisch eine Zusammenfassung nach Transkription
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Über
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                App-Name
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                CDB BrainRecorder
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Version
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                1.0.0
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Phase
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                Phase 1 - Offline First
              </Text>
            </View>
          </View>
        </View>

        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              Aktueller Modus: {themeMode === 'auto' ? 'Automatisch' : themeMode === 'light' ? 'Hell' : 'Dunkel'}
              {themeMode === 'auto' && ` (${isDark ? 'Dunkel' : 'Hell'})`}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginLeft: 52,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
