import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { MaterialIcons } from '@expo/vector-icons';
import { Circle } from 'react-native-progress'; // Import Circle for circular progress
import LinearGradient from "react-native-linear-gradient";

export default function App() {
  const [activeTab, setActiveTab] = useState('Welcome');
  const [progress, setProgress] = useState(0.7); // Initial progress (70%)

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
    <SafeAreaView style={styles.container}>
      {/* Conditionally Render App Bar */}
      {activeTab === 'Fact Check' && (
        <View style={styles.appBar}>
          <Image
            source={require('./assets/images/verifAI_logo.png')}
            style={styles.appBarLogo}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Only show progress bar on the Fact Check screen */}
      {activeTab === 'Fact Check' && (
        <View style={styles.progressContainer}>
          <Circle
            size={60} // Size of the circle
            progress={progress} // Set the progress value (0 to 1)
            showsText={true} // Show text in the center
            color="#007AFF" // Circle color
            unfilledColor="#ddd" // Unfilled portion color
            borderWidth={2}
          />
        </View>
      )}

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Only show Logo and Welcome text on Welcome screen */}
        {activeTab === 'Welcome' && (
          <>
            <Image
              source={require('./assets/images/verifAI_logo.png')}
              style={styles.logo}
            />
          </>
        )}

        <View style={styles.markdownContainer}>
          <Markdown style={markdownStyles}>
            {activeTab === 'Welcome' ? markdownWelcome : markdownFactCheck}
          </Markdown>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setActiveTab('Welcome')}
        >
          <MaterialIcons name="home" size={28} color={activeTab === 'Welcome' ? '#007AFF' : '#888'} />
          <Text style={[styles.navText, activeTab === 'Welcome' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setActiveTab('Fact Check')}
        >
          <MaterialIcons name="fact-check" size={28} color={activeTab === 'Fact Check' ? '#007AFF' : '#888'} />
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
    height: 60,
    backgroundColor: '#f8f6f3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  appBarLogo: {
    height: 60,
    width: 120,
  },
  scrollContent: {
    padding: 20,
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
  markdownContainer: {
    marginTop: 10,
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#f8f6f3',
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
    color: '#007AFF',
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
