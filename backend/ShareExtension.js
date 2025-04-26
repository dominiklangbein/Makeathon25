import { View, Text, Button } from 'react-native';
import { close } from 'expo-share-extension';

export default function ShareExtension(props) {
  const { url, text } = props;  // Initial props from the share

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Shared URL: {url}</Text>
      <Text>Shared Text: {text}</Text>
      <Button title="Close" onPress={close} />
    </View>
  );
}
