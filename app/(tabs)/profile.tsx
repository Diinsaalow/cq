import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  LogOut,
  Bell,
  Moon,
  HardDrive,
  Info,
  Lock,
  ChevronRight,
  Headphones,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { username, logout } = useAuth();
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const menuItems = [
    {
      id: 'account',
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Profile Information',
          icon: <User size={20} color={Colors.textDark} />,
          onPress: () => console.log('Profile pressed'),
        },
        {
          id: 'security',
          title: 'Security',
          icon: <Lock size={20} color={Colors.textDark} />,
          onPress: () => console.log('Security pressed'),
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Preferences',
      items: [
        {
          id: 'appearance',
          title: 'Dark Mode',
          icon: <Moon size={20} color={Colors.textDark} />,
          toggle: true,
          value: darkMode,
          onToggle: (value: boolean) => setDarkMode(value),
        },
        {
          id: 'notifications',
          title: 'Notifications',
          icon: <Bell size={20} color={Colors.textDark} />,
          toggle: true,
          value: notifications,
          onToggle: (value: boolean) => setNotifications(value),
        },
        {
          id: 'storage',
          title: 'Manage Storage',
          icon: <HardDrive size={20} color={Colors.textDark} />,
          onPress: () => console.log('Storage pressed'),
        },
        {
          id: 'audio',
          title: 'Audio Quality',
          icon: <Headphones size={20} color={Colors.textDark} />,
          onPress: () => console.log('Audio pressed'),
        },
      ],
    },
    {
      id: 'about',
      title: 'About',
      items: [
        {
          id: 'about',
          title: 'About Diinsaalow',
          icon: <Info size={20} color={Colors.textDark} />,
          onPress: () => console.log('About pressed'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <User size={40} color={Colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{username || 'Diinsaalow User'}</Text>
            <Text style={styles.userEmail}>user@example.com</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section) => (
          <View key={section.id} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.toggle ? undefined : item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  {item.icon}
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                </View>
                {item.toggle ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{
                      false: 'rgba(0,0,0,0.1)',
                      true: Colors.primary + '80',
                    }}
                    thumbColor={item.value ? Colors.primary : '#f4f3f4'}
                  />
                ) : (
                  <ChevronRight size={20} color={Colors.textLight} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.primary} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Diinsaalow v1.0.0</Text>
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
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.white,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textLight,
  },
  menuSection: {
    marginBottom: 20,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
    marginLeft: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    color: Colors.textDark,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 40,
  },
});
