import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { colors } from '@shared/theme';
import { HomeScreen } from '@app/HomeScreen';
import {
  WifiCredentialsListScreen,
  WifiCredentialDetailScreen,
} from '@features/wifiCredentials';
import {
  LicenseKeysListScreen,
  LicenseKeyDetailScreen,
} from '@features/licenseKeys';
import {
  RecoveryCodesListScreen,
  RecoveryCodeDetailScreen,
} from '@features/recoveryCodes';
import {
  ImportantNumbersListScreen,
  ImportantNumberDetailScreen,
} from '@features/importantNumbers';
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
        <Stack.Screen
          name="LicenseKeysList"
          component={LicenseKeysListScreen}
          options={{ title: 'License Keys' }}
        />
        <Stack.Screen
          name="LicenseKeyDetail"
          component={LicenseKeyDetailScreen}
          options={{ title: 'License Key' }}
        />
        <Stack.Screen
          name="RecoveryCodesList"
          component={RecoveryCodesListScreen}
          options={{ title: 'Recovery Codes' }}
        />
        <Stack.Screen
          name="RecoveryCodeDetail"
          component={RecoveryCodeDetailScreen}
          options={{ title: 'Recovery Codes' }}
        />
        <Stack.Screen
          name="ImportantNumbersList"
          component={ImportantNumbersListScreen}
          options={{ title: 'Important Numbers' }}
        />
        <Stack.Screen
          name="ImportantNumberDetail"
          component={ImportantNumberDetailScreen}
          options={{ title: 'Important Number' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
