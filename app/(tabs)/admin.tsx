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
import Colors from '../../constants/Colors';
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

  const adminOptions = [
    {
      id: 'upload',
      title: 'Upload Audio',
      icon: <Upload size={24} color={Colors.primary} />,
      description: 'Add new audio files to the app',
      onPress: () => router.push('/upload'),
      isPrimary: true,
    },
    {
      id: 'manage',
      title: 'Manage Content',
      icon: <List size={24} color={Colors.textDark} />,
      description: 'Edit or delete existing content',
      onPress: () => console.log('Manage content'),
    },
    {
      id: 'users',
      title: 'Manage Users',
      icon: <Users size={24} color={Colors.textDark} />,
      description: 'View and manage user accounts',
      onPress: () => console.log('Manage users'),
    },
    {
      id: 'stats',
      title: 'Analytics',
      icon: <BarChart size={24} color={Colors.textDark} />,
      description: 'View app usage statistics',
      onPress: () => console.log('View analytics'),
    },
    {
      id: 'settings',
      title: 'App Settings',
      icon: <Settings size={24} color={Colors.textDark} />,
      description: 'Configure app behavior',
      onPress: () => console.log('Open settings'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Sections</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Audio Files</Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.optionsGrid}>
            {adminOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  option.isPrimary && styles.primaryOptionCard,
                ]}
                onPress={option.onPress}
              >
                <View
                  style={[
                    styles.iconContainer,
                    option.isPrimary && styles.primaryIconContainer,
                  ]}
                >
                  {option.icon}
                </View>
                <Text
                  style={[
                    styles.optionTitle,
                    option.isPrimary && styles.primaryOptionTitle,
                  ]}
                >
                  {option.title}
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    option.isPrimary && styles.primaryOptionDescription,
                  ]}
                >
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                <FileAudio size={20} color={Colors.white} />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityTitle}>New audio uploaded</Text>
                <Text style={styles.activityTime}>Today, 2:30 PM</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                <PlusCircle size={20} color={Colors.white} />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityTitle}>New section created</Text>
                <Text style={styles.activityTime}>Yesterday, 10:15 AM</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                <FileAudio size={20} color={Colors.white} />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityTitle}>New audio uploaded</Text>
                <Text style={styles.activityTime}>Yesterday, 9:45 AM</Text>
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
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
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
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: Colors.white,
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
    backgroundColor: Colors.primary,
    width: '100%',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
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
    color: Colors.textDark,
    marginBottom: 4,
  },
  primaryOptionTitle: {
    color: Colors.white,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  primaryOptionDescription: {
    color: 'rgba(255,255,255,0.8)',
  },
  recentSection: {
    marginBottom: 24,
  },
  activityList: {
    backgroundColor: Colors.white,
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
    backgroundColor: Colors.primary,
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
    color: Colors.textDark,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
});
