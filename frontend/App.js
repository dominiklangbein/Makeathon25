import React, {useEffect, useState} from 'react';
import {Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Markdown from 'react-native-markdown-display';
import {MaterialIcons} from '@expo/vector-icons';
import * as Linking from 'expo-linking';
/* import { LinearGradient } from 'expo-linear-gradient';
import CircularProgress from 'react-native-circular-progress-indicator';*/

export default function App() {
  const [activeTab, setActiveTab] = useState('Welcome');
  const [loading, setLoading] = useState(false);


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
          const resultMarkdown = data.result;
          console.log('Fact-Check Result:\n', resultMarkdown);

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

  const fetchJobStatus = async (jobId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/fact_checker/status/${jobId}`);
      const data = await response.json();

      if (data.status === 'done') {
        const resultMarkdown = formatResultToMarkdown(data.result);
        console.log('Fact-Check Result from Backend:\n', resultMarkdown);  // Log result to console

        Alert.alert(
          'Fact-Check Complete',
          'The fact-checking process is done! (Check console for backend result)',
          [
            {
              text: 'OK',
              onPress: () => {
                setActiveTab('Fact Check');  // UI stays with dummy data
              },
            },
          ],
          { cancelable: false }
        );
      } else if (data.status === 'error') {
        Alert.alert('Error', `Job failed: ${data.result}`);
      } else {
        setTimeout(() => fetchJobStatus(jobId), 3000); // poll again if pending
      }
    } catch (error) {
      console.error('Error fetching job status:', error);
      Alert.alert('Error', 'Could not fetch job status.');
    } finally {
      setLoading(false);
    }
  };



  const markdownWelcome = `# Welcome to VerifAI!`;
  const markdownFactCheck = `1. **Fake News or Not:** No

2. **Reasoning:** 
   The video frames show a group of young men performing a stunt where a metal rod is being pressed against their mouths or jaws, likely as a display of strength or endurance. The transcript "میری تیجاں ڈھونڈی پھا۔" (transliteration: "meri tejan dhoondi pha") is in Saraiki/Punjabi and roughly translates to "I have found my strength" or "I have found my energy." There is no indication from the visuals or the transcript that this video is making any factual claim about news, politics, health, or any other topic that could be classified as "fake news." It appears to be a stunt or entertainment video.

3. **Supporting Evidence:**
   - The visuals show a physical stunt, not a news event or informational content.
   - The transcript is a personal or motivational statement, not a factual claim.
   - There are no references to current events, health advice, or any controversial topic.
   - The setting and participants suggest a casual, possibly rural environment, typical for social media entertainment content.

4. **Sources:**
   - [General understanding of fake news criteria](https://en.wikipedia.org/wiki/Fake_news)
   - [Translation and context of Saraiki/Punjabi phrase](https://translate.google.com/)

5. **Conclusion:**
   The video is not fake news. It is a stunt or entertainment video with no connection to any news topic or factual claim that could be classified as misinformation or disinformation.
`;



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeTab === 'Welcome' ? '#f8f6f3' : 'white' }]}>
      {/* Conditionally Render App Bar */}
      {activeTab === 'Fact Check' && (
        <View style={styles.appBar}>
          <MaterialIcons name="arrow-back-ios" size={24} color="black" style={{ marginLeft: 10 }} onPress={() => setActiveTab('Welcome')}/>
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

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#2aa1c9' }]}
                onPress={() => setActiveTab('Fact Check')}>
                <Text style={styles.buttonText}>FACT CHECK</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#3884d5' }]}
                onPress={() => setActiveTab('Fact Check')}>
                <Text style={styles.buttonText}>FACT CHECK and CLOSE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#644fdd' }]}
                onPress={() => setActiveTab('Fact Check')}>
                <Text style={styles.buttonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Fact Check screen content */}
        {activeTab === 'Fact Check' && (
        <View style={styles.markdownContainerFactCheck}>
          <Markdown style={markdownStyles}>
            {markdownFactCheck}
          </Markdown>
        </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setActiveTab('Welcome')}
        >
          <MaterialIcons name="home" size={28} color={activeTab === 'Welcome' ? '#f8f5f3' : '#777'} />
          <Text style={[styles.navText, activeTab === 'Welcome' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setActiveTab('Fact Check')}
        >
          <MaterialIcons name="fact-check" size={28} color={activeTab === 'Fact Check' ? '#f8f5f3' : '#777'}/>
          <Text style={[styles.navText, activeTab === 'Fact Check' && styles.activeNavText]}>Fact Check</Text>
        </TouchableOpacity>
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
  appBarLogo: {
    width: 60,
    height: 60,
    marginLeft: 'auto',
    marginRight: 10
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
    marginTop: 35,
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
    color: '#777',
    marginTop: 4,
  },
  activeNavText: {
    color: '#f8f5f3',
    fontWeight: 'bold',
  },
});

const markdownStyles = {
  body: {
    fontSize: 18,
    color: '#333',
    paddingHorizontal: 10,
  },
};

