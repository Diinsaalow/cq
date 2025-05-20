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
  Animated,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { database, config } from '../../lib/appwrite';
import getColors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { User as UserIcon, Shield, Plus } from 'lucide-react-native';

interface UserDoc {
  $id: string;
  email: string;
  role: string;
  authId: string;
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
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'success' });
  const fadeAnim = React.useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (refreshing && users.length === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.7,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(0.3);
    }
  }, [refreshing, users.length]);

  async function fetchUsers() {
    setRefreshing(true);
    try {
      const res = await database.listDocuments(config.db, config.col.users);
      setUsers(res.documents as unknown as UserDoc[]);
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

  // const handleAddUser = async () => {
  //   setError('');
  //   setSuccess('');
  //   if (!email.trim() || !password.trim()) {
  //     setToast({
  //       visible: true,
  //       message: 'Email and password are required',
  //       type: 'error',
  //     });
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     await signup(email, password, newRole);
  //     setToast({
  //       visible: true,
  //       message: 'User created successfully!',
  //       type: 'success',
  //     });
  //     setEmail('');
  //     setPassword('');
  //     setNewRole('user');
  //     setShowModal(false);
  //     fetchUsers();
  //   } catch (err: any) {
  //     setToast({
  //       visible: true,
  //       message: err.message || 'Failed to create user',
  //       type: 'error',
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const renderSkeleton = () => (
    <View style={{ gap: 16 }}>
      {[1, 2, 3].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.card,
            {
              backgroundColor: '#F5F7FA',
              opacity: fadeAnim,
              borderColor: '#eee',
              shadowColor: '#eee',
            },
          ]}
        >
          <View style={styles.avatarContainer} />
          <View style={styles.userInfo}>
            <View
              style={{
                height: 18,
                width: 120,
                backgroundColor: '#e0e0e0',
                borderRadius: 8,
                marginBottom: 8,
              }}
            />
            <View
              style={{
                height: 14,
                width: 60,
                backgroundColor: '#e0e0e0',
                borderRadius: 8,
              }}
            />
          </View>
        </Animated.View>
      ))}
    </View>
  );

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
      </View>
      <ScrollView contentContainerStyle={styles.listContainer}>
        {refreshing && users.length === 0 ? (
          renderSkeleton()
        ) : (
          <>
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
                        user.role === 'admin'
                          ? colors.primary
                          : colors.textLight
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
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {/* <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowModal(true)}
      >
        <Plus color={colors.white} size={24} />
      </TouchableOpacity> */}

      {/* <Modal
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
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      /> */}
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
