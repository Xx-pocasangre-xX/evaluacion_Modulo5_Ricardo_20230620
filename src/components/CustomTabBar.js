import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function CustomTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();

    const tabs = [
        {
            name: 'Home',
            icon: '🏠',
            activeIcon: '🏡',
            label: 'Inicio',
            gradient: ['#6366f1', '#8b5cf6'],
        },
        {
            name: 'EditProfile',
            icon: '⚙️',
            activeIcon: '✨',
            label: 'Perfil',
            gradient: ['#10b981', '#059669'],
        }
    ];

    return (
        <View style={[
            styles.container,
            {
                paddingBottom: Math.max(insets.bottom, 16),
                paddingLeft: Math.max(insets.left, 20),
                paddingRight: Math.max(insets.right, 20),
            }
        ]}>
            {/* Elemento decorativo superior */}
            <View style={styles.topIndicator} />
            
            <View style={styles.tabsContainer}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const tab = tabs.find(t => t.name === route.name);
                    if (!tab) return null;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tabWrapper}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.tab,
                                isFocused && styles.activeTab
                            ]}>
                                {/* Contenedor del ícono */}
                                <View style={[
                                    styles.iconContainer,
                                    isFocused && styles.activeIconContainer
                                ]}>
                                    <Text style={[
                                        styles.icon,
                                        isFocused && styles.activeIcon
                                    ]}>
                                        {isFocused ? tab.activeIcon : tab.icon}
                                    </Text>
                                    
                                    {/* Indicador de actividad */}
                                    {isFocused && <View style={styles.activeIndicator} />}
                                </View>

                                {/* Etiqueta del tab */}
                                <Text style={[
                                    styles.label,
                                    isFocused && styles.activeLabel
                                ]}>
                                    {tab.label}
                                </Text>

                                {/* Punto indicador cuando está activo */}
                                {isFocused && <View style={styles.activeDot} />}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        paddingTop: 16,
        paddingHorizontal: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        position: 'relative',
    },
    topIndicator: {
        width: 40,
        height: 4,
        backgroundColor: '#e5e7eb',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    tabWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    tab: {
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        minWidth: 80,
        position: 'relative',
        transition: 'all 0.3s ease',
    },
    activeTab: {
        backgroundColor: '#f8fafc',
        shadowColor: '#6366f1',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        position: 'relative',
        transition: 'all 0.3s ease',
    },
    activeIconContainer: {
        backgroundColor: '#6366f1',
        transform: [{ scale: 1.1 }],
        shadowColor: '#6366f1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    icon: {
        fontSize: 20,
        transition: 'all 0.3s ease',
    },
    activeIcon: {
        fontSize: 22,
        transform: [{ scale: 1.1 }],
    },
    activeIndicator: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    label: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
        marginTop: 4,
        transition: 'all 0.3s ease',
    },
    activeLabel: {
        color: '#6366f1',
        fontWeight: '700',
        fontSize: 13,
    },
    activeDot: {
        position: 'absolute',
        bottom: 4,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#6366f1',
    },
});