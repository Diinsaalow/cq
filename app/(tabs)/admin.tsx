import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import getColors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Upload,
  List,
  BarChart,
  Settings,
  Users,
  PlusCircle,
  FileAudio,
  FileVideo,
} from 'lucide-react-native';

export default function AdminScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getColors(theme);

  const adminOptions = [
    {
      id: 'upload',
      title: 'Upload Audio',
      icon: <Upload size={24} color={colors.white} />,
      description: 'Add new audio files to the app',
      onPress: () => router.push('/upload'),
      isPrimary: true,
    },
    {
      id: 'manage',
      title: 'Manage Content',
      icon: <List size={24} color={colors.textDark} />,
      description: 'Edit or delete existing content',
      onPress: () => console.log('Manage content'),
    },
    {
      id: 'users',
      title: 'Manage Users',
      icon: <Users size={24} color={colors.textDark} />,
      description: 'View and manage user accounts',
      onPress: () => console.log('Manage users'),
    },
    {
      id: 'stats',
      title: 'Analytics',
      icon: <BarChart size={24} color={colors.textDark} />,
      description: 'View app usage statistics',
      onPress: () => console.log('View analytics'),
    },
    {
      id: 'settings',
      title: 'App Settings',
      icon: <Settings size={24} color={colors.textDark} />,
      description: 'Configure app behavior',
      onPress: () => console.log('Open settings'),
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.white, borderBottomColor: colors.shadow },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.textDark }]}>
          Admin Dashboard
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.white }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              2
            </Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>
              Categories
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.white }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              8
            </Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>
              Sections
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.white }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              24
            </Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>
              Audio Files
            </Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textDark }]}>
            Quick Actions
          </Text>
          <View style={styles.optionsGrid}>
            {adminOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  option.isPrimary && styles.primaryOptionCard,
                  option.isPrimary && { backgroundColor: colors.primary },
                  !option.isPrimary && { backgroundColor: colors.white },
                ]}
                onPress={option.onPress}
              >
                <View
                  style={[
                    styles.iconContainer,
                    option.isPrimary && styles.primaryIconContainer,
                    option.isPrimary && {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    },
                    !option.isPrimary && {
                      backgroundColor: 'rgba(0,0,0,0.05)',
                    },
                  ]}
                >
                  {option.icon}
                </View>
                <Text
                  style={[
                    styles.optionTitle,
                    option.isPrimary && styles.primaryOptionTitle,
                    option.isPrimary && { color: colors.white },
                    !option.isPrimary && { color: colors.textDark },
                  ]}
                >
                  {option.title}
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    option.isPrimary && styles.primaryOptionDescription,
                    option.isPrimary && { color: 'rgba(255,255,255,0.8)' },
                    !option.isPrimary && { color: colors.textLight },
                  ]}
                >
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.recentSection}>
          <Text style={[styles.sectionTitle, { color: colors.textDark }]}>
            Recent Activity
          </Text>
          <View
            style={[styles.activityList, { backgroundColor: colors.white }]}
          >
            <View style={styles.activityItem}>
              <View
                style={[
                  styles.activityIconContainer,
                  { backgroundColor: colors.primary },
                ]}
              >
                <FileAudio size={20} color={colors.white} />
              </View>
              <View style={styles.activityDetails}>
                <Text
                  style={[styles.activityTitle, { color: colors.textDark }]}
                >
                  New audio uploaded
                </Text>
                <Text
                  style={[styles.activityTime, { color: colors.textLight }]}
                >
                  Today, 2:30 PM
                </Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View
                style={[
                  styles.activityIconContainer,
                  { backgroundColor: colors.primary },
                ]}
              >
                <PlusCircle size={20} color={colors.white} />
              </View>
              <View style={styles.activityDetails}>
                <Text
                  style={[styles.activityTitle, { color: colors.textDark }]}
                >
                  New section created
                </Text>
                <Text
                  style={[styles.activityTime, { color: colors.textLight }]}
                >
                  Yesterday, 10:15 AM
                </Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View
                style={[
                  styles.activityIconContainer,
                  { backgroundColor: colors.primary },
                ]}
              >
                <FileAudio size={20} color={colors.white} />
              </View>
              <View style={styles.activityDetails}>
                <Text
                  style={[styles.activityTitle, { color: colors.textDark }]}
                >
                  New audio uploaded
                </Text>
                <Text
                  style={[styles.activityTime, { color: colors.textLight }]}
                >
                  Yesterday, 9:45 AM
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryOptionCard: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    width: '100%',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryOptionTitle: {
    color: 'rgba(255,255,255,0.8)',
  },
  optionDescription: {
    fontSize: 14,
  },
  primaryOptionDescription: {
    color: 'rgba(255,255,255,0.8)',
  },
  recentSection: {
    marginBottom: 24,
  },
  activityList: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
  },
});
