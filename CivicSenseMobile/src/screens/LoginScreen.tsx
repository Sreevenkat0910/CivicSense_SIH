import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

interface LoginScreenProps {
  onLogin: (credentials: { email: string; password: string }) => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  error?: string;
  isLoading?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onSwitchToRegister,
  onForgotPassword,
  error,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const formOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const errorOpacity = useSharedValue(0);

  useEffect(() => {
    // Entrance animations
    logoScale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1, { damping: 8, stiffness: 100 })
    );
    logoOpacity.value = withTiming(1, { duration: 800 });
    
    formTranslateY.value = withTiming(0, { duration: 600, delay: 300 });
    formOpacity.value = withTiming(1, { duration: 600, delay: 300 });
  }, []);

  useEffect(() => {
    if (error) {
      errorOpacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300, delay: 3000 })
      );
    }
  }, [error]);

  const validateField = (name: string, value: string) => {
    let errorMessage = '';
    
    switch (name) {
      case 'email':
        if (!value.trim()) {
          errorMessage = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          errorMessage = 'Password is required';
        } else if (value.length < 6) {
          errorMessage = 'Password must be at least 6 characters';
        }
        break;
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));

    return !errorMessage;
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleInputBlur = (name: string, value: string) => {
    validateField(name, value);
  };

  const handleSubmit = () => {
    // Button press animation
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    // Validate all fields
    const emailValid = validateField('email', formData.email);
    const passwordValid = validateField('password', formData.password);
    
    if (emailValid && passwordValid) {
      onLogin(formData);
    }
  };

  const isFormValid = formData.email && formData.password && 
                     Object.values(fieldErrors).every(error => !error);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formTranslateY.value }],
    opacity: formOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const errorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
  }));

  return (
    <LinearGradient
      colors={['#f8fafc', '#e2e8f0', '#cbd5e1']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            {/* Header with Logo */}
            <Animated.View style={[styles.header, logoAnimatedStyle]}>
              <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                <LinearGradient
                  colors={['#3b82f6', '#1d4ed8']}
                  style={styles.logoGradient}
                >
                  <Text style={styles.logoText}>CR</Text>
                </LinearGradient>
              </Animated.View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to your Civic Issue Reporter account</Text>
            </Animated.View>

            {/* Error Alert */}
            {error && (
              <Animated.View style={[styles.errorContainer, errorAnimatedStyle]}>
                <Icon name="error" size={20} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            {/* Login Form */}
            <Animated.View style={[styles.form, formAnimatedStyle]}>
              {/* Email Field */}
              <AnimatedInputField
                label="Email Address *"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                onBlur={() => handleInputBlur('email', formData.email)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                icon="email"
                error={fieldErrors.email}
                delay={0}
              />

              {/* Password Field */}
              <AnimatedInputField
                label="Password *"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                onBlur={() => handleInputBlur('password', formData.password)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                icon="lock"
                error={fieldErrors.password}
                delay={100}
                rightIcon={showPassword ? "visibility-off" : "visibility"}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              {/* Forgot Password */}
              <Animated.View style={[styles.forgotPasswordContainer, { opacity: formOpacity.value }]}>
                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={onForgotPassword}
                  disabled={isLoading}
                >
                  <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Submit Button */}
              <Animated.View style={buttonAnimatedStyle}>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!isFormValid || isLoading) && styles.submitButtonDisabled
                  ]}
                  onPress={handleSubmit}
                  disabled={!isFormValid || isLoading}
                >
                  <LinearGradient
                    colors={isFormValid && !isLoading ? ['#3b82f6', '#1d4ed8'] : ['#9ca3af', '#6b7280']}
                    style={styles.submitButtonGradient}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#ffffff" />
                        <Text style={styles.submitButtonText}>Signing in...</Text>
                      </View>
                    ) : (
                      <View style={styles.submitButtonContent}>
                        <Icon name="login" size={20} color="#ffffff" />
                        <Text style={styles.submitButtonText}>Sign In</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>

            {/* Switch to Register */}
            <Animated.View style={[styles.switchContainer, { opacity: formOpacity.value }]}>
              <Text style={styles.switchText}>
                Don't have an account?{' '}
                <TouchableOpacity onPress={onSwitchToRegister} disabled={isLoading}>
                  <Text style={styles.switchLink}>Create account</Text>
                </TouchableOpacity>
              </Text>
            </Animated.View>

            {/* Help Text */}
            <Animated.Text style={[styles.helpText, { opacity: formOpacity.value }]}>
              By signing in, you agree to help improve your community
            </Animated.Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

// Animated Input Field Component
const AnimatedInputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  editable,
  icon,
  error,
  delay = 0,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
}: any) => {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 400, delay });
    opacity.value = withTiming(1, { duration: 400, delay });
    scale.value = withTiming(1, { duration: 400, delay });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.inputContainer, animatedStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <Icon name={icon} size={20} color="#6b7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          secureTextEntry={secureTextEntry}
        />
        {rightIcon && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={onRightIconPress}
            disabled={!editable}
          >
            <Icon name={rightIcon} size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Animated.Text style={[styles.fieldError, { opacity: error ? 1 : 0 }]}>
          {error}
        </Animated.Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    color: '#dc2626',
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputError: {
    borderColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOpacity: 0.1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  fieldError: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 8,
    fontWeight: '500',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  forgotPassword: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 12,
    height: 56,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    shadowOpacity: 0.1,
  },
  submitButtonGradient: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  switchText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  switchLink: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
});