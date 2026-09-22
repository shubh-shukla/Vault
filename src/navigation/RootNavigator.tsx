import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { colors } from '@shared/theme';
import { HomeScreen } from '@app/HomeScreen';
import {
  WifiCredentialsListScreen,
  WifiCredentialDetailScreen,
} from '@features/wifiCredentials';
import type { RootStackParamList } from './types';

if (process.env.JEST_WORKER_ID === undefined) {
  enableScreens();
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Vault' }}
        />
        <Stack.Screen
          name="WifiCredentialsList"
          component={WifiCredentialsListScreen}
          options={{ title: 'Wi-Fi Credentials' }}
        />
        <Stack.Screen
          name="WifiCredentialDetail"
          component={WifiCredentialDetailScreen}
          options={{ title: 'Wi-Fi Credential' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
