import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  Linking,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView
} from 'react-native';
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

      const deeplink = `myapp://job/${jobId}`;
      Linking.openURL(deeplink);
      setTimeout(() => {
        close();
      }, 1000);  // 1 second delay before closing
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Could not start the backend process.');
    } finally {
      close(); // Ensure the share extension closes
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require('./assets/images/verifAI_logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>VerifAI - Share Extension</Text>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Shared URL:</Text>
          <Text style={styles.content}>{url || 'N/A'}</Text>
          <Text style={styles.label}>Shared Text:</Text>
          <Text style={styles.content}>{text || 'N/A'}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#2aa1c9' }]} onPress={triggerBackend}>
              <Text style={styles.buttonText}>FACT CHECK</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#3884d5' }]} onPress={close}>
              <Text style={styles.buttonText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f3',
  },
  scrollContent: {
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoBox: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333333',
    marginTop: 10,
  },
  content: {
    fontSize: 16,
    color: '#555555',
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '85%',
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
