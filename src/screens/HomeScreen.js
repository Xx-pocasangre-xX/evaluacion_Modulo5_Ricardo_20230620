import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';

export default function HomeScreen({ navigation }) {
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUserInfo = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDoc(doc(database, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserInfo(userDoc.data());
                } else {
                    console.log('No se encontró información del usuario');
                    setUserInfo({
                        name: user.displayName || 'Usuario',
                        email: user.email,
                        degree: 'No especificado',
                        graduationYear: 'No especificado'
                    });
                }
            }
        } catch (error) {
            console.error('Error al obtener información del usuario: ', error);
            Alert.alert('Error', 'No se pudo cargar la información del usuario');
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUserInfo();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro que deseas cerrar sesión?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Cerrar Sesión',
                    onPress: async () => {
                        try {
                            await signOut(auth);
                            console.log('Usuario deslogueado');
                        } catch (error) {
                            console.error('Error al cerrar sesión: ', error);
                            Alert.alert('Error', 'No se pudo cerrar sesión');
                        }
                    },
                },
            ],
        );
    };

    const handleEditProfile = () => {
        navigation.navigate('EditProfile', { userInfo });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Cargando tu perfil...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={onRefresh}
                    colors={['#6366f1']}
                    tintColor="#6366f1"
                />
            }
            showsVerticalScrollIndicator={false}
        >
            {/* Header con gradiente */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <View style={styles.greetingSection}>
                        <Text style={styles.greetingText}>{getGreeting()}</Text>
                        <Text style={styles.nameText}>{userInfo?.name || 'Usuario'}</Text>
                    </View>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {getInitials(userInfo?.name)}
                        </Text>
                        <View style={styles.onlineIndicator} />
                    </View>
                </View>
            </View>

            {/* Estadísticas rápidas */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <View style={styles.statIcon}>
                        <Text style={styles.statEmoji}>🎓</Text>
                    </View>
                    <Text style={styles.statValue}>1</Text>
                    <Text style={styles.statLabel}>Título</Text>
                </View>
                
                <View style={styles.statCard}>
                    <View style={styles.statIcon}>
                        <Text style={styles.statEmoji}>📅</Text>
                    </View>
                    <Text style={styles.statValue}>
                        {userInfo?.graduationYear && userInfo.graduationYear !== 'No especificado' 
                            ? new Date().getFullYear() - parseInt(userInfo.graduationYear)
                            : '0'
                        }
                    </Text>
                    <Text style={styles.statLabel}>Años exp.</Text>
                </View>
                
                <View style={styles.statCard}>
                    <View style={styles.statIcon}>
                        <Text style={styles.statEmoji}>✨</Text>
                    </View>
                    <Text style={styles.statValue}>100%</Text>
                    <Text style={styles.statLabel}>Completo</Text>
                </View>
            </View>

            {/* Información del perfil */}
            <View style={styles.profileSection}>
                <Text style={styles.sectionTitle}>Mi Información</Text>
                
                <View style={styles.infoCard}>
                    <View style={styles.infoItem}>
                        <View style={styles.infoIconContainer}>
                            <Text style={styles.infoIcon}>👤</Text>
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Nombre completo</Text>
                            <Text style={styles.infoValue}>{userInfo?.name || 'No especificado'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoDivider} />

                    <View style={styles.infoItem}>
                        <View style={styles.infoIconContainer}>
                            <Text style={styles.infoIcon}>📧</Text>
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Correo electrónico</Text>
                            <Text style={styles.infoValue}>{userInfo?.email || 'No especificado'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoDivider} />

                    <View style={styles.infoItem}>
                        <View style={styles.infoIconContainer}>
                            <Text style={styles.infoIcon}>🎓</Text>
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Título universitario</Text>
                            <Text style={styles.infoValue}>{userInfo?.degree || 'No especificado'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoDivider} />

                    <View style={styles.infoItem}>
                        <View style={styles.infoIconContainer}>
                            <Text style={styles.infoIcon}>📅</Text>
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Año de graduación</Text>
                            <Text style={styles.infoValue}>
                                {userInfo?.graduationYear && userInfo.graduationYear !== 'No especificado' 
                                    ? userInfo.graduationYear.toString() 
                                    : 'No especificado'
                                }
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Acciones */}
            <View style={styles.actionsSection}>
                <Text style={styles.sectionTitle}>Acciones</Text>
                
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleEditProfile}
                    activeOpacity={0.7}
                >
                    <View style={styles.actionIconContainer}>
                        <Text style={styles.actionIcon}>✏️</Text>
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Editar Perfil</Text>
                        <Text style={styles.actionSubtitle}>Actualiza tu información personal</Text>
                    </View>
                    <Text style={styles.actionArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.logoutButton]}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <View style={[styles.actionIconContainer, styles.logoutIconContainer]}>
                        <Text style={styles.actionIcon}>🚪</Text>
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={[styles.actionTitle, styles.logoutText]}>Cerrar Sesión</Text>
                        <Text style={[styles.actionSubtitle, styles.logoutSubtext]}>Salir de tu cuenta</Text>
                    </View>
                    <Text style={[styles.actionArrow, styles.logoutText]}>→</Text>
                </TouchableOpacity>
            </View>

            {/* Espaciado inferior */}
            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500',
    },
    headerContainer: {
        backgroundColor: '#6366f1',
        paddingTop: 60,
        paddingBottom: 32,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greetingSection: {
        flex: 1,
    },
    greetingText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
        fontWeight: '400',
    },
    nameText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingTop: 24,
        gap: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statEmoji: {
        fontSize: 20,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
        textAlign: 'center',
    },
    profileSection: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    infoCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    infoIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoIcon: {
        fontSize: 18,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '600',
    },
    infoDivider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 16,
        marginLeft: 60,
    },
    actionsSection: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    actionButton: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    logoutButton: {
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e0e7ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    logoutIconContainer: {
        backgroundColor: '#fee2e2',
    },
    actionIcon: {
        fontSize: 20,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '400',
    },
    logoutText: {
        color: '#dc2626',
    },
    logoutSubtext: {
        color: '#991b1b',
    },
    actionArrow: {
        fontSize: 18,
        color: '#9ca3af',
        fontWeight: '600',
    },
    bottomSpacing: {
        height: 32,
    },
});