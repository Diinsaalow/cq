import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import getColors from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react-native';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { signup, role, isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();
  const colors = getColors(theme);

  // Wait for auth state to load before making redirect decision
  if (loading) {
    return null;
  }
  if (!isAuthenticated) {
    router.replace('/login');
    return null;
  }
  if (role !== 'admin') {
    router.replace('/admin');
    return null;
  }

  const handleSignup = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await signup(email, password);
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textDark }]}>
          Create Account
        </Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>
          Sign up for Diinsaalow
        </Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textDark }]}>
              Email
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.white }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textDark }]}>
              Password
            </Text>
            <View
              style={[
                styles.passwordContainer,
                { backgroundColor: colors.white },
              ]}
            >
              <TextInput
                style={[styles.passwordInput, { color: colors.textDark }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={[styles.eyeIcon, { padding: 16 }]}
                onPress={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.textLight} />
                ) : (
                  <Eye size={20} color={colors.textLight} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textDark }]}>
              Confirm Password
            </Text>
            <View
              style={[
                styles.passwordContainer,
                { backgroundColor: colors.white },
              ]}
            >
              <TextInput
                style={[styles.passwordInput, { color: colors.textDark }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={[styles.eyeIcon, { padding: 16 }]}
                onPress={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={colors.textLight} />
                ) : (
                  <Eye size={20} color={colors.textLight} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <Text style={[styles.errorText, { color: '#ff3b30' }]}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[styles.signupButton, { backgroundColor: colors.primary }]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={[styles.signupButtonText, { color: colors.white }]}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginLink, { marginTop: 16 }]}
            onPress={() => router.replace('/login')}
          >
            <Text style={[styles.loginLinkText, { color: colors.primary }]}>
              Already have an account? Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 16,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
  },
  signupButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
