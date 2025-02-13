import type { StackScreenProps } from '@react-navigation/stack';
import type { Paths } from '@/navigation/paths';

export type RootStackParamList = {
  [Paths.Startup]: undefined;
  [Paths.Example]: undefined;
  [Paths.Onboarding]: undefined;
  [Paths.Register]: undefined;
  [Paths.Login]: undefined;
  [Paths.Splash]: undefined;
  [Paths.Home]: undefined;
  [Paths.Gorev]: undefined;
  [Paths.Gorev_Listesi]: undefined;
  [Paths.Leaderboard]: undefined;
  [Paths.Settings]: undefined;
  [Paths.Empty]: undefined;
  [Paths.VideoRecord]: undefined;
  [Paths.PdfViewer]: undefined;
};

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;
