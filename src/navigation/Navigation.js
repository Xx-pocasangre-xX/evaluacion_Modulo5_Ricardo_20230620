import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Importamos pantallas
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

// Importamos nuestro CustomTabBar
import CustomTabBar from '../components/CustomTabBar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Componente para las pantallas con tabs
function AuthenticatedTabs() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#2196F3',
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerTitleAlign: 'center',
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Inicio',
                }}
            />
            <Tab.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{
                    title: 'Editar Perfil',
                }}
            />
        </Tab.Navigator>
    );
}

export default function Navigation({ user }) {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={user ? "AuthenticatedTabs" : "Login"}>
                {user ? (
                    // Pantallas para usuarios autenticados con tabs
                    <Stack.Screen
                        name="AuthenticatedTabs"
                        component={AuthenticatedTabs}
                        options={{ headerShown: false }}
                    />
                ) : (
                    // Pantallas para usuarios no autenticados
                    <>
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Register"
                            component={RegisterScreen}
                            options={{
                                title: 'Registro',
                                headerTitleAlign: 'center',
                                headerStyle: {
                                    backgroundColor: '#2196F3',
                                },
                                headerTintColor: '#FFFFFF',
                                headerTitleStyle: {
                                    fontWeight: 'bold',
                                },
                            }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}