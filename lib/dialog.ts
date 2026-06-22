import { Alert, Platform } from 'react-native';

// 웹에서는 react-native의 Alert.alert가 동작하지 않으므로
// window.confirm / window.alert로 분기하는 크로스 플랫폼 헬퍼

// 단순 알림
export const notify = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
};

// 확인/취소 다이얼로그. 확인 시 onConfirm 실행
export const confirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText = '확인',
  cancelText = '취소',
) => {
  if (Platform.OS === 'web') {
    if (window.confirm(message ? `${title}\n\n${message}` : title)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel' },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
};
