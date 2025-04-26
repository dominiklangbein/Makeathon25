import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";

export default function App() {
  const [activeTab, setActiveTab] = useState('Welcome');
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [fetchedMarkdown, setFetchedMarkdown] = useState('');

  const handleTabSwitch = async () => {
    setActiveTab('Fact Check');
    await fetchFactCheckData();
  };

  const fetchFactCheckData = async () => {
  try {
    setLoading(true);
    const response = await fetch('https://your-backend-url.com/api/factcheck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ link: userInput }), // sending user input (if needed)
    });

    const data = await response.json(); // assuming backend responds with JSON
    setFetchedMarkdown(data.markdown); // data.markdown is your backend text
  } catch (error) {
    console.error('Error fetching fact check:', error);
  } finally {
    setLoading(false);
  }
};

  const handleCloseApp = () => {
    // TODO: Add real close logic if needed (depending on platform)
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeTab === 'Welcome' ? '#f8f6f3' : 'white' }]}>

      {/* App Bar */}
      {activeTab === 'Fact Check' && (
        <View style={styles.appBar}>
          <MaterialIcons
            name="arrow-back-ios"
            size={24}
            color="black"
            style={{ marginLeft: 10 }}
            onPress={() => setActiveTab('Welcome')}
          />

          <View style={styles.titleContainer}>
            <Text style={styles.factcheck_title}>{fetchedMarkdown.title}
            </Text>
          </View>

          <Image
            source={require('./assets/images/verifAI_logo.png')}
            style={styles.appBarLogo}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'Welcome' && (
          <View style={styles.markdownContainerWelcome}>
            <Image
              source={require('./assets/images/verifAI_logo.png')}
              style={styles.logo}
            />
            <View style={{ marginTop: -25, marginBottom: 20 }}>
              <Markdown style={markdownStyles}>
                # Welcome to VerifAI!
              </Markdown>
            </View>
            {/* --- NEW Text Input Field Here --- */}
            <TextInput
              style={styles.textInput}
              placeholder="Paste your link here..."
              placeholderTextColor="#aaa"
              value={userInput}
              onChangeText={text => setUserInput(text)}
            />

            {/* Buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#2aa1c9' }]}
                onPress={handleTabSwitch}>
                <Text style={styles.buttonText}>FACT CHECK</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#3884d5' }]}
                onPress={handleCloseApp}>
                <Text style={styles.buttonText}>FACT CHECK and CLOSE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#644fdd' }]}
                onPress={handleCloseApp}>
                <Text style={styles.buttonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Fact Check Screen */}
        {activeTab === 'Fact Check' && (
          <View style={styles.markdownContainerFactCheck}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size={75} color="#3884d5" />
              </View>
            ) : (
              <>
                <Image source={require('./assets/images/verifAI_logo.png')} style={styles.result_number} />
                <Markdown style={markdownStyles}>{fetchedMarkdown.markdown}</Markdown>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setActiveTab('Welcome')}>
          <MaterialIcons name="home" size={28} color={activeTab === 'Welcome' ? '#f8f5f3' : '#777'} />
          <Text style={[styles.navText, activeTab === 'Welcome' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setActiveTab('Fact Check')}>
          <MaterialIcons name="fact-check" size={28} color={activeTab === 'Fact Check' ? '#f8f5f3' : '#777'} />
          <Text style={[styles.navText, activeTab === 'Fact Check' && styles.activeNavText]}>Fact Check</Text>
        </TouchableOpacity>

        <LinearGradient
          colors={['#ff7e5f', '#feb47b']}
          style={styles.gradient}
        >
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f3',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f6f3',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factcheck_title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    flexWrap: 'wrap',
    marginRight: 10,
  },
  appBarLogo: {
    width: 60,
    height: 60,
    marginLeft: 'auto',
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 20,
  },
  logo: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    marginBottom: 10,
  },
  markdownContainerWelcome: {
    alignItems: 'center',
  },
  markdownContainerFactCheck: {
    marginTop: 10,
  },
  buttonGroup: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  button: {
    width: '85%',
    marginTop: 15,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
  textInput: {
    width: '85%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    marginTop: 20,
    color: '#333',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#082545',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  activeNavText: {
    color: '#f8f5f3',
    fontWeight: 'bold',
  },
  loadingContainer: {
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10,
  },
  result_number: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 10,
  },
});

const markdownStyles = {
  body: {
    fontSize: 18,
    color: '#333',
    paddingHorizontal: 10,
  },
};
