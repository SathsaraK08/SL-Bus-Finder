import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
    return (
        <>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#0f172a',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    contentStyle: {
                        backgroundColor: '#0f172a',
                    },
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        headerShown: false,
                        title: 'Bus Finder'
                    }}
                />
                <Stack.Screen
                    name="contribute"
                    options={{
                        title: 'Contribute Route',
                        presentation: 'modal',
                    }}
                />
            </Stack>
        </>
    );
}
