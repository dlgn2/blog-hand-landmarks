import type { RootStackParamList } from '@/navigation/types';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { CopilotProvider } from 'react-native-copilot';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { Paths } from '@/navigation/paths';

import AndroidTest from '@/screens/AndroidTest';
import Empty from '@/screens/Empty';
import Home from '@/screens/Home/Home';
import QuestionSinglePage from '@/screens/Home/QuestionSinglePage';
import TaskList from '@/screens/Home/TaskList';
import LeaderBoard from '@/screens/LeaderBoard';
import Login from '@/screens/Login/Login';
import Onboarding from '@/screens/Onboarding/Onboarding';
import PdfViewer from '@/screens/Register/PDFViewer';
import Register from '@/screens/Register/Register';
import Settings from '@/screens/Settings';
import Splash from '@/screens/Splash/Splash';
import Test from '@/screens/Test';

import { AuthProvider } from '@/context/AuthContext';
import { LevelsProvider } from '@/context/LevelContext';

const Stack = createStackNavigator<RootStackParamList>();

function ApplicationNavigator() {
  const { variant, navigationTheme } = useTheme();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <AuthProvider>
          <LevelsProvider>
            <Stack.Navigator
              initialRouteName={Paths.Empty}
              key={variant}
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen component={Empty} name={Paths.Empty} />
              <Stack.Screen component={Splash} name={Paths.Splash} />
              <Stack.Screen component={Register} name={Paths.Register} />
              <Stack.Screen component={Login} name={Paths.Login} />
              <Stack.Screen component={Home} name={Paths.Home} />
              <Stack.Screen component={Onboarding} name={Paths.Onboarding} />
              <Stack.Screen component={QuestionSinglePage} name={Paths.Gorev} />
              <Stack.Screen component={TaskList} name={Paths.Gorev_Listesi} />
              <Stack.Screen component={LeaderBoard} name={Paths.Leaderboard} />
              <Stack.Screen component={Settings} name={Paths.Settings} />
              <Stack.Screen component={Test} name={Paths.VideoRecord} />
              <Stack.Screen component={PdfViewer} name={Paths.PdfViewer} />
            </Stack.Navigator>
          </LevelsProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default ApplicationNavigator;
