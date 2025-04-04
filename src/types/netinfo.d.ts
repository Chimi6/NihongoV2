declare module '@react-native-community/netinfo' {
  interface NetInfoState {
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
    type: string | null;
  }

  interface NetInfo {
    fetch(): Promise<NetInfoState>;
  }

  const netInfo: NetInfo;
  export default netInfo;
} 