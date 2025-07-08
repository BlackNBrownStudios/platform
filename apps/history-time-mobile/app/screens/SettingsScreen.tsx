import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  Switch,
  TouchableRipple,
  RadioButton,
  Divider,
  Button,
} from 'react-native-paper';

import HistoricalEventsToggle from '../components/HistoricalEventsToggle';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAppTheme, ThemeType } from '../themes/ThemeContext';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SettingsScreen = () => {
  const { theme, styles: themeStyles, setTheme, themeStyles: allThemeStyles } = useAppTheme();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Available themes for selection
  const themes: { id: ThemeType; name: string }[] = [
    { id: 'light', name: 'Light' },
    { id: 'dark', name: 'Dark' },
    { id: 'blue', name: 'Blue' },
    { id: 'green', name: 'Green' },
    { id: 'sepia', name: 'Sepia' },
  ];

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeStyles.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Card style={[styles.card, { backgroundColor: themeStyles.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>Appearance</Text>
          <Divider style={styles.divider} />

          <Text style={[styles.subSectionTitle, { color: themeStyles.text }]}>Theme</Text>

          <RadioButton.Group
            onValueChange={(value) => handleThemeChange(value as ThemeType)}
            value={theme}
          >
            {themes.map((themeOption) => (
              <TouchableRipple
                key={themeOption.id}
                onPress={() => handleThemeChange(themeOption.id)}
              >
                <View style={styles.radioItem}>
                  <View style={styles.radioLeftContent}>
                    <View
                      style={[
                        styles.themePreview,
                        {
                          backgroundColor: allThemeStyles[themeOption.id].background,
                          borderColor:
                            theme === themeOption.id ? themeStyles.primary : 'transparent',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.themePreviewHeader,
                          { backgroundColor: allThemeStyles[themeOption.id].primary },
                        ]}
                      />
                      <View
                        style={[
                          styles.themePreviewCard,
                          { backgroundColor: allThemeStyles[themeOption.id].surface },
                        ]}
                      />
                    </View>
                    <Text style={[styles.radioLabel, { color: themeStyles.text }]}>
                      {themeOption.name}
                    </Text>
                  </View>
                  <RadioButton value={themeOption.id} />
                </View>
              </TouchableRipple>
            ))}
          </RadioButton.Group>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: themeStyles.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>Developer Options</Text>
          <Divider style={styles.divider} />

          <Text style={[styles.subSectionTitle, { color: themeStyles.text }]}>
            Data Source Options
          </Text>

          {/* Historical Events API/Mock Toggle */}
          <HistoricalEventsToggle />

          <Text style={[styles.subSectionTitle, { color: themeStyles.text, marginTop: 16 }]}>
            Shared Components Testing
          </Text>

          <Button
            mode="outlined"
            style={[styles.button, { borderColor: themeStyles.primary }]}
            labelStyle={{ color: themeStyles.primary }}
            onPress={() => navigation.navigate('CardManagerTest')}
          >
            Test CardManager Integration
          </Button>

          <Text style={[styles.switchDescription, { color: themeStyles.text + '99' }]}>
            View CardManager shared component integration status
          </Text>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: themeStyles.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>Notifications</Text>
          <Divider style={styles.divider} />

          <TouchableRipple onPress={() => setNotificationsEnabled(!notificationsEnabled)}>
            <View style={styles.switchItem}>
              <Text style={[styles.switchLabel, { color: themeStyles.text }]}>
                Enable Notifications
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                color={themeStyles.primary}
              />
            </View>
          </TouchableRipple>

          <Text style={[styles.switchDescription, { color: themeStyles.text + '99' }]}>
            Get notified about new challenges and game events
          </Text>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: themeStyles.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>Sound</Text>
          <Divider style={styles.divider} />

          <TouchableRipple onPress={() => setSoundEnabled(!soundEnabled)}>
            <View style={styles.switchItem}>
              <Text style={[styles.switchLabel, { color: themeStyles.text }]}>Game Sounds</Text>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                color={themeStyles.primary}
              />
            </View>
          </TouchableRipple>

          <Text style={[styles.switchDescription, { color: themeStyles.text + '99' }]}>
            Toggle sound effects during gameplay
          </Text>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: themeStyles.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>Account</Text>
          <Divider style={styles.divider} />

          <Button
            mode="contained"
            style={[styles.button, { backgroundColor: themeStyles.primary }]}
            onPress={() => {
              /* Would handle logout */
            }}
          >
            Log Out
          </Button>

          <Button
            mode="outlined"
            style={styles.button}
            onPress={() => {
              /* Would delete account */
            }}
          >
            Delete Account
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Text style={[styles.version, { color: themeStyles.text + '60' }]}>
          History Time v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  radioLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    fontSize: 16,
  },
  themePreview: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 16,
    overflow: 'hidden',
    borderWidth: 2,
  },
  themePreviewHeader: {
    height: 16,
  },
  themePreviewCard: {
    height: 20,
    margin: 6,
    borderRadius: 2,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
  },
  switchDescription: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  version: {
    fontSize: 14,
  },
});
