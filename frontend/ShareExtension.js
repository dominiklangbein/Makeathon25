import React, { useState } from 'react';
import { View, Text, Button, Alert, ActivityIndicator, Linking } from 'react-native';
import { close } from 'expo-share-extension';

export default function ShareExtension(props) {
  const { url, text } = props;  // Initial props from the share

  const [loading, setLoading] = useState(false);

  const triggerBackend = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/fact_checker/checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Backend request failed');
      }

      const data = await response.json();
      const jobId = data.jobId;

      if (!jobId) {
        throw new Error('No jobId returned from backend');
      }

      // Open the deeplink to the main app with the jobId
      const deeplink = `myapp://job/${jobId}`;
      Linking.openURL(deeplink);
      // Add a small delay before closing
      setTimeout(() => {
      close();
      }, 1000);  // 500ms delay

    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Could not start the backend process.');
    } finally {
      // Close the share extension regardless
      close();
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ marginBottom: 10 }}>Shared URL: {url || 'N/A'}</Text>
      <Text style={{ marginBottom: 20 }}>Shared Text: {text || 'N/A'}</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Button title="Load" onPress={triggerBackend} />
          <View style={{ height: 10 }} />
          <Button title="Close" onPress={close} />
        </>
      )}
    </View>
  );
}
