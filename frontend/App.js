import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import {MaterialIcons} from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as Progress from 'react-native-progress';

export default function App() {
  const [activeTab, setActiveTab] = useState('Welcome');
  const [loading, setLoading] = useState(false);
  const [factCheckMarkdown, setFactCheckMarkdown] = useState('');
  const [factCheckNumber, setFactCheckNumber] = useState(0.0);
  const [factCheckTitle, setFactCheckTitle] = useState('');
  const [userInput, setUserInput] = useState('');

   // Linking setup
  useEffect(() => {
  const handleDeepLink = async (event) => {
    const url = event.url;
    const { path } = Linking.parse(url);
    console.log('Received Deep Link:', path);

      try {
        const response = await fetch(`http://localhost:8000/fact_checker/status/${path}`);
        const data = await response.json();

        if (data.status === 'done') {
          const fullResult = data.result[0].slice(3, -3);
          const [responseTitel, ...restLines] = fullResult.split('\n');
          const resultMarkdown = restLines.join('\n');
          const responseNumber = data.result[1];
          console.log('Content:\n', resultMarkdown);
          console.log('Number:\n', responseNumber)
          console.log('Title:\n', responseTitel)
          setFactCheckMarkdown(resultMarkdown);
          setFactCheckNumber(responseNumber)
          setFactCheckTitle(responseTitel.slice(2))

          Alert.alert('Fact-Check Complete', 'The fact-checking process is done!', [
            { text: 'OK', onPress: () => setActiveTab('Fact Check') }
          ]);
        } else if (data.status === 'error') {
          Alert.alert('Error', `Job failed: ${data.result}`);
        } else {
          Alert.alert('Pending', 'The fact-checking process is still running.');
        }
      } catch (error) {
        console.error('Error fetching job status:', error);
        Alert.alert('Error', 'Could not fetch job status.');
      }
  };

  const subscription = Linking.addEventListener('url', handleDeepLink);

  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink({ url });
  });

  return () => subscription.remove();
  }, []);

  const process_url = async (url) => {
    setFactCheckMarkdown('');
    setFactCheckNumber(0);
    setFactCheckTitle('');
    setLoading(true)
    setActiveTab('Fact Check')
    try {
      const response = await fetch('http://localhost:8000/fact_checker/checker_url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      console.log("Hier kommt er noch an \n", data)

      const fullResult_url = data[0].slice(3, -3);
      console.log('Hier komme ich nicht hin')
      const [responseTitel_url, ...restLines_url] = fullResult_url.split('\n');
      const resultMarkdown_url = restLines_url.join('\n');
      const responseNumber_url = data[1];
      console.log('Content:\n', resultMarkdown_url);
      console.log('Number:\n', responseNumber_url)
      console.log('Title:\n', responseTitel_url)
      setFactCheckMarkdown(resultMarkdown_url);
      setFactCheckNumber(responseNumber_url)
      setFactCheckTitle(responseTitel_url.slice(2))

      Alert.alert('Fact-Check Complete', 'The fact-checking process is done!', [
        { text: 'OK', onPress: () => setActiveTab('Fact Check') }
      ]);
    } catch (error) {
      console.error('Error fetching job status:', error);
      Alert.alert('Error', 'Could not fetch job status.');
    } finally {
      setLoading(false)
    }
  }

  const markdownWelcome = `# Welcome to VerifAI!`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeTab === 'Welcome' ? '#f8f6f3' : 'white' }]}>
      {/* Conditionally Render App Bar */}
      {activeTab === 'Fact Check' && (
        <View style={styles.appBar}>
          <MaterialIcons name="arrow-back-ios" size={24} color="black" style={{ marginLeft: 10 }} onPress={() => setActiveTab('Welcome')}/>
          <View style={styles.titleContainer}>
            <Text style={styles.factcheck_title}>{factCheckTitle}</Text>
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
        {/* Only show Logo and Welcome text on Welcome screen */}
        {activeTab === 'Welcome' && (
          <View style={styles.markdownContainerWelcome}>
            <Image
              source={require('./assets/images/verifAI_logo.png')}
              style={styles.logo}
            />
            <Markdown style={markdownStyles}>
              {markdownWelcome}
            </Markdown>
            <TextInput
              style={styles.textInput}
              placeholder="Paste your link here..."
              placeholderTextColor="#aaa"
              value={userInput}
              onChangeText={text => setUserInput(text)} />

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#3884d5' }]}
                onPress={() => process_url(userInput)}>
                <Text style={styles.buttonText}>FACT CHECK</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Fact Check screen content */}
        {activeTab === 'Fact Check' && (
          <View style={styles.markdownContainerFactCheck}>
            {loading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                <View style={{ transform: [{ scale: 1.25 }] }}>
                  <ActivityIndicator size="large" color="#3884d5" />
                </View>
                <Text style={{ marginTop: 20, fontSize: 18 }}>Fact-checking in progress...</Text>
              </View>
            ) : (
              <>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ marginBottom: 10, fontSize: 18 }}>
                    Fake News Probability: {factCheckNumber.toString()}%
                  </Text>
                  <Progress.Bar
                    progress={factCheckNumber / 100}
                    width={250}
                    height={15}
                    borderRadius={8}
                    color={
                      factCheckNumber < 30
                        ? 'green'
                        : factCheckNumber < 60
                        ? 'yellow'
                        : 'red'
                    }
                    style={{ marginBottom: 20 }}
                  />
                </View>
                <Markdown style={markdownStyles}>
                  {factCheckMarkdown}
                </Markdown>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <ImageBackground
        source={require('./assets/images/BottomNavigationBarBanner.png')} // Adjust the path!
        style={styles.bottomNav}
        resizeMode="cover"
      >
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setActiveTab('Welcome')}
        >
          <MaterialIcons name="home" size={28} color={activeTab === 'Welcome' ? '#f8f5f3' : '#888'} />
          <Text style={[styles.navText, activeTab === 'Welcome' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setActiveTab('Fact Check')}
        >
          <MaterialIcons name="fact-check" size={28} color={activeTab === 'Fact Check' ? '#f8f5f3' : '#888'} />
          <Text style={[styles.navText, activeTab === 'Fact Check' && styles.activeNavText]}>Fact Check</Text>
        </TouchableOpacity>
      </ImageBackground>
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
  appBarLogo: {
    width: 60,
    height: 60,
    marginLeft: 'auto',
    marginRight: 10
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
    textAlign: 'left',
    flexWrap: 'wrap',
    marginRight: 10,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
  },
  markdownContainerWelcome: {
    alignItems: 'center',
    marginTop: 10,
  },
  markdownContainerFactCheck: {
    marginTop: 10,
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonGroup: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#888',
    marginTop: 4,
  },
  activeNavText: {
    color: '#f8f5f3',
    fontWeight: 'bold',
  },
  textInput: {
    width: '85%',
    height: 50,
    borderColor: '#2aa1c9',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    marginTop: 150,
    color: '#333',
  },
});

const markdownStyles = {
  body: {
    fontSize: 18,
    color: '#333',
    paddingHorizontal: 10,
  },
};

