import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, database } from '../config/firebase';

export default function EditProfileScreen({ navigation, route }) {
    const [formData, setFormData] = useState({
        name: '',
        degree: '',
        graduationYear: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userDoc = await getDoc(doc(database, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setFormData({
                            name: userData.name || '',
                            degree: userData.degree || '',
                            graduationYear: userData.graduationYear ? userData.graduationYear.toString() : ''
                        });
                    }
                }
            } catch (error) {
                console.error('Error al cargar datos del usuario: ', error);
                Alert.alert('Error', 'No se pudo cargar la información del usuario');
            }
        };

        loadUserData();
    }, []);

    // Funciones memoizadas para evitar re-creación en cada render
    const handleNameChange = React.useCallback((value) => updateField('name', value), []);
    const handleDegreeChange = React.useCallback((value) => updateField('degree', value), []);
    const handleGraduationYearChange = React.useCallback((value) => updateField('graduationYear', value), []);
    
    const handleCurrentPasswordChange = React.useCallback((value) => updatePasswordField('currentPassword', value), []);
    const handleNewPasswordChange = React.useCallback((value) => updatePasswordField('newPassword', value), []);
    const handleConfirmPasswordChange = React.useCallback((value) => updatePasswordField('confirmPassword', value), []);

    const updateField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const updatePasswordField = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateProfileForm = () => {
        const { name, degree, graduationYear } = formData;

        if (!name.trim() || !degree.trim() || !graduationYear.trim()) {
            Alert.alert('Error', 'Por favor, complete todos los campos');
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

    const validatePasswordForm = () => {
        const { currentPassword, newPassword, confirmPassword } = passwordData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Por favor, complete todos los campos de contraseña');
            return false;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
            return false;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return false;
        }

        return true;
    };

    const handleUpdateProfile = async () => {
        if (!validateProfileForm()) return;

        setIsLoading(true);

        try {
            const user = auth.currentUser;
            if (user) {
                await updateDoc(doc(database, 'users', user.uid), {
                    name: formData.name.trim(),
                    degree: formData.degree.trim(),
                    graduationYear: parseInt(formData.graduationYear),
                    updatedAt: new Date().toISOString(),
                });

                Alert.alert(
                    '¡Éxito!',
                    'Tu perfil ha sido actualizado correctamente',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error('Error al actualizar perfil: ', error);
            Alert.alert('Error', 'No se pudo actualizar el perfil');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!validatePasswordForm()) return;

        setIsLoading(true);

        try {
            const user = auth.currentUser;
            if (user) {
                const credential = EmailAuthProvider.credential(
                    user.email,
                    passwordData.currentPassword
                );

                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, passwordData.newPassword);

                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setShowPasswordForm(false);

                Alert.alert('¡Éxito!', 'Tu contraseña ha sido actualizada correctamente');
            }
        } catch (error) {
            console.error('Error al cambiar contraseña: ', error);

            let errorMessage = 'Error al cambiar la contraseña';
            switch (error.code) {
                case 'auth/wrong-password':
                    errorMessage = 'La contraseña actual es incorrecta';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'La nueva contraseña es muy débil';
                    break;
                default:
                    errorMessage = error.message;
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const InputField = React.memo(({ label, placeholder, value, onChangeText, keyboardType = 'default', secureTextEntry = false, maxLength, autoCapitalize = 'none', field }) => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    focusedInput === field && styles.inputFocused
                ]}
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                value={value}
                onChangeText={onChangeText}
                onFocus={() => setFocusedInput(field)}
                onBlur={() => setFocusedInput(null)}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                maxLength={maxLength}
                autoCapitalize={autoCapitalize}
                blurOnSubmit={false}
                returnKeyType="next"
            />
        </View>
    ));

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerIcon}>
                        <Text style={styles.headerEmoji}>✏️</Text>
                    </View>
                    <Text style={styles.headerTitle}>Editar Perfil</Text>
                    <Text style={styles.headerSubtitle}>Mantén tu información actualizada</Text>
                </View>

                {/* Información Personal */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconContainer}>
                            <Text style={styles.sectionIcon}>👤</Text>
                        </View>
                        <Text style={styles.sectionTitle}>Información Personal</Text>
                    </View>

                    <View style={styles.formCard}>
                        <InputField
                            label="Nombre completo"
                            placeholder="Tu nombre completo"
                            value={formData.name}
                            onChangeText={handleNameChange}
                            autoCapitalize="words"
                            field="name"
                        />

                        <InputField
                            label="Título universitario"
                            placeholder="Tu título o carrera"
                            value={formData.degree}
                            onChangeText={handleDegreeChange}
                            autoCapitalize="words"
                            field="degree"
                        />

                        <InputField
                            label="Año de graduación"
                            placeholder="2024"
                            value={formData.graduationYear}
                            onChangeText={handleGraduationYearChange}
                            keyboardType="numeric"
                            maxLength={4}
                            field="graduationYear"
                        />

                        <TouchableOpacity
                            style={[styles.updateButton, isLoading && styles.disabledButton]}
                            onPress={handleUpdateProfile}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.updateButtonText}>Guardar Cambios</Text>
                                    <Text style={styles.buttonIcon}>✓</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Seguridad */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconContainer}>
                            <Text style={styles.sectionIcon}>🔒</Text>
                        </View>
                        <Text style={styles.sectionTitle}>Seguridad</Text>
                    </View>

                    <View style={styles.formCard}>
                        <TouchableOpacity
                            style={styles.passwordToggleButton}
                            onPress={() => setShowPasswordForm(!showPasswordForm)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.toggleContent}>
                                <View style={styles.toggleIconContainer}>
                                    <Text style={styles.toggleIcon}>
                                        {showPasswordForm ? '🔓' : '🔐'}
                                    </Text>
                                </View>
                                <View style={styles.toggleTextContainer}>
                                    <Text style={styles.toggleTitle}>Cambiar Contraseña</Text>
                                    <Text style={styles.toggleSubtitle}>
                                        {showPasswordForm ? 'Ocultar formulario' : 'Actualizar tu contraseña'}
                                    </Text>
                                </View>
                                <Text style={styles.toggleArrow}>
                                    {showPasswordForm ? '↑' : '↓'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {showPasswordForm && (
                            <View style={styles.passwordForm}>
                                <InputField
                                    label="Contraseña actual"
                                    placeholder="Tu contraseña actual"
                                    value={passwordData.currentPassword}
                                    onChangeText={handleCurrentPasswordChange}
                                    secureTextEntry={true}
                                    field="currentPassword"
                                />

                                <InputField
                                    label="Nueva contraseña"
                                    placeholder="Mínimo 6 caracteres"
                                    value={passwordData.newPassword}
                                    onChangeText={handleNewPasswordChange}
                                    secureTextEntry={true}
                                    field="newPassword"
                                />

                                <InputField
                                    label="Confirmar nueva contraseña"
                                    placeholder="Repite la nueva contraseña"
                                    value={passwordData.confirmPassword}
                                    onChangeText={handleConfirmPasswordChange}
                                    secureTextEntry={true}
                                    field="confirmPassword"
                                />

                                <TouchableOpacity
                                    style={[styles.passwordButton, isLoading && styles.disabledButton]}
                                    onPress={handleChangePassword}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFFFFF" size="small" />
                                    ) : (
                                        <>
                                            <Text style={styles.passwordButtonText}>Actualizar Contraseña</Text>
                                            <Text style={styles.buttonIcon}>🔑</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Botón de cancelar */}
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                {/* Espaciado inferior */}
                <View style={styles.bottomSpacing} />
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
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    headerIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#6366f1',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    headerEmoji: {
        fontSize: 32,
        color: '#ffffff',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        fontWeight: '400',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e7ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sectionIcon: {
        fontSize: 18,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
        letterSpacing: -0.3,
    },
    formCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 6,
    },
    inputContainer: {
        marginBottom: 20,
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
        borderRadius: 14,
        fontSize: 16,
        backgroundColor: '#f9fafb',
        color: '#1f2937',
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
    updateButton: {
        backgroundColor: '#10b981',
        padding: 18,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 8,
        shadowColor: '#10b981',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    updateButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    buttonIcon: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    passwordToggleButton: {
        backgroundColor: '#f8fafc',
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        marginBottom: 16,
    },
    toggleContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e0e7ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    toggleIcon: {
        fontSize: 20,
    },
    toggleTextContainer: {
        flex: 1,
    },
    toggleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 2,
    },
    toggleSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '400',
    },
    toggleArrow: {
        fontSize: 18,
        color: '#9ca3af',
        fontWeight: '600',
    },
    passwordForm: {
        marginTop: 8,
    },
    passwordButton: {
        backgroundColor: '#f59e0b',
        padding: 18,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 8,
        shadowColor: '#f59e0b',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    passwordButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    disabledButton: {
        backgroundColor: '#9ca3af',
        shadowOpacity: 0,
        elevation: 0,
    },
    cancelButton: {
        backgroundColor: 'transparent',
        padding: 18,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        marginTop: 8,
    },
    cancelButtonText: {
        color: '#6b7280',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomSpacing: {
        height: 32,
    },
});