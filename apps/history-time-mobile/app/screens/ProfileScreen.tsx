import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Card, Text, Button, TextInput, Avatar, Divider, ProgressBar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSharedAuth } from '../hooks/useSharedAuth';
import { useSharedProfile } from '../hooks/useSharedProfile';
import { useAppTheme } from '../themes/ThemeContext';

export const ProfileScreen: React.FC = () => {
  const { styles: themeStyles } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});

  // Use shared hooks for consistent behavior with web
  const profileHook = useSharedProfile();
  const [authState] = useSharedAuth();
  const { profile, loading, updating, error } = profileHook;
  const { fetchProfile, updateProfile, uploadPicture, pickProfileImage } = profileHook;
  const { user } = authState;

  // Initialize profile data
  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id, fetchProfile]);

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setEditedData({
        name: profile.name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        preferredCategory: profile.preferredCategory || '',
      });
    }
  }, [profile]);

  // Handle profile image selection
  const handleChangePhoto = async () => {
    try {
      const imageUri = await pickProfileImage();

      if (imageUri && uploadPicture) {
        // Cast the URI to any to handle the type mismatch between platforms
        await uploadPicture(imageUri as any);
        fetchProfile(); // Refresh profile data
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload profile picture');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editedData);
      setIsEditing(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  if (loading && !profile) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={themeStyles.primary} />
        <Text style={{ marginTop: 16, color: themeStyles.text }}>Loading profile...</Text>
      </View>
    );
  }

  const renderProfileForm = () => (
    <Card style={[styles.card, { backgroundColor: themeStyles.surface }]}>
      <Card.Content>
        <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>Edit Profile</Text>
        <Divider style={styles.divider} />

        <View style={styles.avatarEditContainer}>
          <Avatar.Image
            size={80}
            source={{
              uri: profile?.profilePicture || 'https://randomuser.me/api/portraits/men/32.jpg',
            }}
            style={styles.avatar}
          />
          <Button
            mode="text"
            onPress={handleChangePhoto}
            style={{ marginTop: 8 }}
            textColor={themeStyles.primary}
            loading={updating}
            disabled={updating}
          >
            Change Photo
          </Button>
        </View>

        <TextInput
          label="Name"
          value={editedData.name}
          onChangeText={(text) => setEditedData({ ...editedData, name: text })}
          style={styles.input}
          mode="outlined"
          outlineColor={themeStyles.surface}
          activeOutlineColor={themeStyles.primary}
        />

        <TextInput
          label="Email"
          value={editedData.email}
          onChangeText={(text) => setEditedData({ ...editedData, email: text })}
          style={styles.input}
          mode="outlined"
          outlineColor={themeStyles.surface}
          activeOutlineColor={themeStyles.primary}
          keyboardType="email-address"
        />

        <TextInput
          label="Bio"
          value={editedData.bio}
          onChangeText={(text) => setEditedData({ ...editedData, bio: text })}
          style={styles.input}
          mode="outlined"
          outlineColor={themeStyles.surface}
          activeOutlineColor={themeStyles.primary}
          multiline
          numberOfLines={3}
        />

        <TextInput
          label="Preferred Category"
          value={editedData.preferredCategory}
          onChangeText={(text) => setEditedData({ ...editedData, preferredCategory: text })}
          style={styles.input}
          mode="outlined"
          outlineColor={themeStyles.surface}
          activeOutlineColor={themeStyles.primary}
        />

        <View style={styles.buttonRow}>
          <Button
            mode="outlined"
            onPress={() => setIsEditing(false)}
            style={[styles.button, { borderColor: themeStyles.primary }]}
            textColor={themeStyles.primary}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSaveProfile}
            style={[styles.button, { backgroundColor: themeStyles.primary }]}
            loading={updating}
            disabled={updating}
          >
            Save
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderProfileInfo = () => (
    <>
      <Card style={[styles.card, { backgroundColor: themeStyles.surface }]}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Avatar.Image
              size={80}
              source={{
                uri: profile?.profilePicture || 'https://randomuser.me/api/portraits/men/32.jpg',
              }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.username, { color: themeStyles.text }]}>{profile?.name}</Text>
              <Text style={[styles.email, { color: themeStyles.text }]}>{profile?.email}</Text>
              <Button
                mode="outlined"
                onPress={() => setIsEditing(true)}
                style={[styles.editButton, { borderColor: themeStyles.primary }]}
                textColor={themeStyles.primary}
              >
                Edit Profile
              </Button>
            </View>
          </View>

          <Divider style={styles.divider} />

          <Text style={[styles.bioText, { color: themeStyles.text }]}>
            {profile?.bio || 'No bio available'}
          </Text>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: themeStyles.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>Game Statistics</Text>
          <Divider style={styles.divider} />

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeStyles.primary }]}>
                {profile?.stats?.totalGames || 0}
              </Text>
              <Text style={[styles.statLabel, { color: themeStyles.text }]}>Games Played</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeStyles.primary }]}>
                {profile?.stats?.gamesWon || 0}
              </Text>
              <Text style={[styles.statLabel, { color: themeStyles.text }]}>Games Won</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeStyles.primary }]}>
                {profile?.stats?.highScore || 0}
              </Text>
              <Text style={[styles.statLabel, { color: themeStyles.text }]}>High Score</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeStyles.primary }]}>
                {profile?.stats?.averageScore || 0}
              </Text>
              <Text style={[styles.statLabel, { color: themeStyles.text }]}>Avg. Score</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: themeStyles.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>Achievements</Text>
          <Divider style={styles.divider} />

          {/* Replace with real achievements when available */}
          {[
            {
              id: 1,
              title: 'First Game',
              description: 'Completed your first timeline game',
              completed: true,
            },
            {
              id: 2,
              title: 'History Expert',
              description: 'Got a perfect score in a timeline game',
              completed: (profile?.stats?.highScore || 0) > 1000,
            },
            {
              id: 3,
              title: 'Knowledge Seeker',
              description: 'Played 10 different category games',
              completed: false,
            },
            {
              id: 4,
              title: 'Time Traveler',
              description: 'Completed 50 timeline games',
              completed: (profile?.stats?.totalGames || 0) >= 50,
            },
          ].map((achievement) => (
            <View key={achievement.id} style={styles.achievementItem}>
              <View style={styles.achievementContent}>
                <View
                  style={[
                    styles.achievementIcon,
                    {
                      backgroundColor: achievement.completed
                        ? themeStyles.primary
                        : themeStyles.primary + '40',
                    },
                  ]}
                >
                  <Text style={styles.achievementIconText}>
                    {achievement.completed ? '✓' : '?'}
                  </Text>
                </View>
                <View style={styles.achievementDetails}>
                  <Text style={[styles.achievementTitle, { color: themeStyles.text }]}>
                    {achievement.title}
                  </Text>
                  <Text style={[styles.achievementDescription, { color: themeStyles.text }]}>
                    {achievement.description}
                  </Text>
                </View>
              </View>
              <ProgressBar
                progress={achievement.completed ? 1 : 0.3}
                color={themeStyles.primary}
                style={styles.achievementProgress}
              />
            </View>
          ))}
        </Card.Content>
      </Card>
    </>
  );

  return (
    <ScrollView
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: themeStyles.background },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      {error && (
        <Card style={[styles.errorCard, { backgroundColor: themeStyles.background }]}>
          <Card.Content>
            <Text style={{ color: 'red' }}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      {isEditing ? renderProfileForm() : renderProfileInfo()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  errorCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 8,
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 12,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  statItem: {
    width: '50%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  avatarEditContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    width: '48%',
  },
  achievementItem: {
    marginBottom: 16,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementIconText: {
    color: 'white',
    fontWeight: 'bold',
  },
  achievementDetails: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
  },
  achievementProgress: {
    height: 6,
    borderRadius: 3,
  },
});
