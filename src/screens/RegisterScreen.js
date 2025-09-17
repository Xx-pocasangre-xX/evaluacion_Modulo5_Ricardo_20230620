import React, { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';

export default function RegisterScreen({ navigation }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        degree: '',
        graduationYear: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    const updateField = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Funciones memoizadas para evitar re-creación en cada render
    const handleNameChange = useCallback((value) => updateField('name', value), [updateField]);
    const handleEmailChange = useCallback((value) => updateField('email', value), [updateField]);
    const handlePasswordChange = useCallback((value) => updateField('password', value), [updateField]);
    const handleDegreeChange = useCallback((value) => updateField('degree', value), [updateField]);
    const handleGraduationYearChange = useCallback((value) => updateField('graduationYear', value), [updateField]);

    const validateForm = () => {
        const { name, email, password, degree, graduationYear } = formData;

        if (!name.trim() || !email.trim() || !password.trim() || !degree.trim() || !graduationYear.trim()) {
            Alert.alert('Error', 'Por favor, complete todos los campos');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Por favor, ingrese un email válido');
            return false;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        const currentYear = new Date().getFullYear();
        const year = parseInt(graduationYear);
        if (isNaN(year) || year < 1950 || year > currentYear + 10) {
            Alert.alert('Error', 'Por favor, ingrese un año de graduación válido');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            const user = userCredential.user;
            console.log('Usuario creado: ', user.uid);

            await setDoc(doc(database, 'users', user.uid), {
                name: formData.name.trim(),
                email: formData.email.toLowerCase(),
                degree: formData.degree.trim(),
                graduationYear: parseInt(formData.graduationYear),
                createdAt: new Date().toISOString(),
            });

            console.log('Datos del usuario guardados en Firebase');

            Alert.alert(
                'Éxito',
                'Usuario registrado correctamente',
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Error en registro: ', error);

            let errorMessage = 'Error al registrar usuario';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Este email ya está registrado';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email inválido';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Operación no permitida';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'La contraseña es muy débil';
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
                    <Text style={styles.title}>Crear Cuenta</Text>
                    <Text style={styles.subtitle}>Únete a nuestra comunidad académica</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Nombre completo</Text>
                        <TextInput
                            style={[
                                styles.input,
                                focusedInput === 'name' && styles.inputFocused
                            ]}
                            placeholder="Tu nombre completo"
                            placeholderTextColor="#9ca3af"
                            value={formData.name}
                            onChangeText={handleNameChange}
                            onFocus={() => setFocusedInput('name')}
                            onBlur={() => setFocusedInput(null)}
                            autoCapitalize="words"
                            autoComplete="name"
                            blurOnSubmit={false}
                            returnKeyType="next"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Correo electrónico</Text>
                        <TextInput
                            style={[
                                styles.input,
                                focusedInput === 'email' && styles.inputFocused
                            ]}
                            placeholder="ejemplo@correo.com"
                            placeholderTextColor="#9ca3af"
                            value={formData.email}
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
                            placeholder="Mínimo 6 caracteres"
                            placeholderTextColor="#9ca3af"
                            value={formData.password}
                            onChangeText={handlePasswordChange}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)}
                            secureTextEntry
                            autoCapitalize="none"
                            blurOnSubmit={false}
                            returnKeyType="next"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Título universitario</Text>
                        <TextInput
                            style={[
                                styles.input,
                                focusedInput === 'degree' && styles.inputFocused
                            ]}
                            placeholder="Licenciatura en..."
                            placeholderTextColor="#9ca3af"
                            value={formData.degree}
                            onChangeText={handleDegreeChange}
                            onFocus={() => setFocusedInput('degree')}
                            onBlur={() => setFocusedInput(null)}
                            autoCapitalize="words"
                            blurOnSubmit={false}
                            returnKeyType="next"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Año de graduación</Text>
                        <TextInput
                            style={[
                                styles.input,
                                focusedInput === 'graduationYear' && styles.inputFocused
                            ]}
                            placeholder="2024"
                            placeholderTextColor="#9ca3af"
                            value={formData.graduationYear}
                            onChangeText={handleGraduationYearChange}
                            onFocus={() => setFocusedInput('graduationYear')}
                            onBlur={() => setFocusedInput(null)}
                            keyboardType="numeric"
                            maxLength={4}
                            blurOnSubmit={false}
                            returnKeyType="done"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.registerButton, isLoading && styles.disabledButton]}
                        onPress={handleRegister}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <>
                                <Text style={styles.registerButtonText}>Crear Cuenta</Text>
                                <Text style={styles.registerButtonIcon}>→</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>o</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.loginButtonText}>Ya tengo una cuenta</Text>
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
    registerButton: {
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
    registerButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    registerButtonIcon: {
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
    loginButton: {
        backgroundColor: 'transparent',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    loginButtonText: {
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