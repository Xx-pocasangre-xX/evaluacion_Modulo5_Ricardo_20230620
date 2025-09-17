import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    // Funciones memoizadas para evitar re-creación en cada render
    const handleEmailChange = React.useCallback((value) => setEmail(value), []);
    const handlePasswordChange = React.useCallback((value) => setPassword(value), []);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Por favor, complete todos los campos');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Por favor, ingrese un email válido');
            return;
        }

        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Usuario logueado: ', userCredential.user.email);
        } catch (error) {
            console.error('Error en login: ', error);

            let errorMessage = 'Error al iniciar sesión';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Email inválido';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Usuario deshabilitado';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'Usuario no encontrado';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Contraseña incorrecta';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Credenciales inválidas';
                    break;
                default:
                    errorMessage = error.message;
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Elementos decorativos */}
                <View style={styles.decorativeShape1} />
                <View style={styles.decorativeShape2} />
                
                <View style={styles.headerContainer}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logo}>🎓</Text>
                    </View>
                    <Text style={styles.title}>Bienvenido</Text>
                    <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Correo electrónico</Text>
                        <TextInput
                            style={[
                                styles.input,
                                focusedInput === 'email' && styles.inputFocused
                            ]}
                            placeholder="ejemplo@correo.com"
                            placeholderTextColor="#9ca3af"
                            value={email}
                            onChangeText={handleEmailChange}
                            onFocus={() => setFocusedInput('email')}
                            onBlur={() => setFocusedInput(null)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            blurOnSubmit={false}
                            returnKeyType="next"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Contraseña</Text>
                        <TextInput
                            style={[
                                styles.input,
                                focusedInput === 'password' && styles.inputFocused
                            ]}
                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            value={password}
                            onChangeText={handlePasswordChange}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)}
                            secureTextEntry
                            autoCapitalize="none"
                            blurOnSubmit={false}
                            returnKeyType="done"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.disabledButton]}
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <>
                                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                                <Text style={styles.loginButtonIcon}>→</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>o</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => navigation.navigate('Register')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.registerButtonText}>Crear nueva cuenta</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Al continuar, aceptas nuestros términos y condiciones
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 60,
    },
    decorativeShape1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#e0e7ff',
        opacity: 0.3,
    },
    decorativeShape2: {
        position: 'absolute',
        top: 100,
        left: -30,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ddd6fe',
        opacity: 0.4,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 48,
        marginTop: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#6366f1',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    logo: {
        fontSize: 32,
        color: '#ffffff',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        fontWeight: '400',
    },
    formContainer: {
        backgroundColor: '#ffffff',
        padding: 32,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8,
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        borderWidth: 2,
        borderColor: '#e5e7eb',
        padding: 16,
        borderRadius: 16,
        fontSize: 16,
        backgroundColor: '#f9fafb',
        color: '#1f2937',
        transition: 'all 0.2s',
    },
    inputFocused: {
        borderColor: '#6366f1',
        backgroundColor: '#ffffff',
        shadowColor: '#6366f1',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    loginButton: {
        backgroundColor: '#6366f1',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 8,
        shadowColor: '#6366f1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: '#9ca3af',
        shadowOpacity: 0,
        elevation: 0,
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    loginButtonIcon: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 32,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e5e7eb',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#9ca3af',
        fontSize: 14,
        fontWeight: '500',
    },
    registerButton: {
        backgroundColor: 'transparent',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    registerButtonText: {
        color: '#6b7280',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 12,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 32,
    },
});