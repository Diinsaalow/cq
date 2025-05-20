import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { database, config } from '../../lib/appwrite';
import getColors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { User as UserIcon, Shield } from 'lucide-react-native';

interface UserDoc {
  $id: string;
  username: string;
  role: string;
  profileImg?: string;
}

export default function ManageUsersScreen() {
  const { role, signup } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getColors(theme);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setRefreshing(true);
    try {
      const res = await database.listDocuments(config.db, config.col.users);
      setUsers(res.documents as UserDoc[]);
    } catch (e) {
      setError('Failed to fetch users');
    } finally {
      setRefreshing(false);
    }
  }

  if (role !== 'admin') {
    router.replace('/admin');
    return null;
  }

  const handleAddUser = async () => {
    setError('');
    setSuccess('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, newRole);
      setSuccess('User created successfully!');
      setEmail('');
      setPassword('');
      setNewRole('user');
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.white, borderBottomColor: colors.shadow },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.textDark }]}>
          Manage Users
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.addButtonText}>+ Add User</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.listContainer}>
        {users.map((user, idx) => (
          <View
            key={user.$id}
            style={[
              styles.card,
              {
                backgroundColor: colors.white,
                shadowColor: colors.shadow,
                borderColor: colors.shadow,
              },
            ]}
          >
            <View style={styles.avatarContainer}>
              <UserIcon size={32} color={colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.username, { color: colors.textDark }]}>
                {user.email}
              </Text>
              <View style={styles.roleBadge}>
                <Shield
                  size={14}
                  color={
                    user.role === 'admin' ? colors.primary : colors.textLight
                  }
                />
                <Text
                  style={[
                    styles.roleText,
                    {
                      color:
                        user.role === 'admin'
                          ? colors.primary
                          : colors.textLight,
                    },
                  ]}
                >
                  {user.role}
                </Text>
              </View>
            </View>
          </View>
        ))}
        {users.length === 0 && !refreshing && (
          <Text
            style={{
              color: colors.textLight,
              textAlign: 'center',
              marginTop: 40,
            }}
          >
            No users found.
          </Text>
        )}
      </ScrollView>
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, { backgroundColor: colors.white }]}
          >
            <Text style={[styles.modalTitle, { color: colors.textDark }]}>
              Add New User
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.textDark, borderColor: colors.shadow },
              ]}
              placeholder="Email"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={[
                styles.input,
                { color: colors.textDark, borderColor: colors.shadow },
              ]}
              placeholder="Password"
              placeholderTextColor={colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <View style={styles.roleSelectRow}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  newRole === 'user' && {
                    backgroundColor: colors.primary + '22',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setNewRole('user')}
              >
                <Text style={{ color: colors.textDark }}>User</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  newRole === 'admin' && {
                    backgroundColor: colors.primary + '22',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setNewRole('admin')}
              >
                <Text style={{ color: colors.primary }}>Admin</Text>
              </TouchableOpacity>
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? <Text style={styles.success}>{success}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleAddUser}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? 'Adding...' : 'Add User'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.accent }]}
                onPress={() => setShowModal(false)}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    backgroundColor: 'rgba(76,175,80,0.07)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  roleSelectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roleOption: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#F5F7FA',
  },
  error: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
  success: {
    color: 'green',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
