import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Secuencia de animaciones más sofisticada
        Animated.sequence([
            // Primero aparece el ícono con rotación
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]),
            // Luego el texto se desliza hacia arriba
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            {/* Fondo degradado */}
            <View style={styles.gradientBackground} />
            
            {/* Elementos decorativos */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.decorativeCircle3} />

            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { scale: scaleAnim },
                            { rotate: rotate }
                        ]
                    }
                ]}
            >
                <View style={styles.iconContainer}>
                    <Text style={styles.logo}>🎓</Text>
                </View>
            </Animated.View>

            <Animated.View
                style={[
                    styles.textContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                <Text style={styles.title}>EduProfile</Text>
                <Text style={styles.subtitle}>Tu futuro académico comienza aquí</Text>
                <View style={styles.loadingDots}>
                    <View style={[styles.dot, styles.dot1]} />
                    <View style={[styles.dot, styles.dot2]} />
                    <View style={[styles.dot, styles.dot3]} />
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#6366f1',
        position: 'relative',
    },
    gradientBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#6366f1',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    decorativeCircle3: {
        position: 'absolute',
        top: height * 0.3,
        left: -20,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    logoContainer: {
        marginBottom: 40,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
        backdropFilter: 'blur(10px)',
    },
    logo: {
        fontSize: 50,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 40,
        lineHeight: 22,
        fontWeight: '300',
    },
    loadingDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        marginHorizontal: 4,
    },
    dot1: {
        animationDelay: '0s',
    },
    dot2: {
        animationDelay: '0.2s',
    },
    dot3: {
        animationDelay: '0.4s',
    },
});