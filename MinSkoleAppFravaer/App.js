import React, { useState, useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

export default function App() {
  const [registreretEnhed, setRegistreretEnhed] = useState(false);
  const [nfcStatus, setNfcStatus] = useState("Tryk på + for at starte scanning");

  useEffect(() => {
    if (Platform.OS !== 'web') {
      NfcManager.start();
    }
  }, []);

  const cancelIfNeeded = async () => {
    try {
      await NfcManager.cancelTechnologyRequest();
      console.log('Forrige NFC-request blev annulleret');
    } catch (e) {
      // Ignorer hvis ingen aktiv request
    }
  };

  const scanNfc = async () => {
    if (Platform.OS === 'web') {
      console.log('NFC ikke understøttet på web');
      setNfcStatus("NFC ikke understøttet på web");
      return;
    }

    setNfcStatus("Anmoder om NFC adgang...");
    await cancelIfNeeded();

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      setNfcStatus("Hold en NFC-tag tæt på...");
      console.log("Venter på NFC-tag...");

      const tag = await NfcManager.getTag();
      console.log("NFC-tag modtaget:", tag);
      setRegistreretEnhed(true);
      setNfcStatus("Enhed registreret!");
    } catch (err) {
      console.warn("NFC fejl:", err);
      setNfcStatus("Fejl under scanning eller annulleret");
    } finally {
      await cancelIfNeeded();
    }
  };

  return (
    <SafeAreaProvider style={styles.mainContainer}>
      <StatusBar style="light" translucent />
      <View style={styles.navbar}>
        <TouchableOpacity style={{ flex: 1, marginLeft: 16 }}>
          <MaterialIcons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navbarTitle}>Tjek ind</Text>

        {!registreretEnhed ? (
          <TouchableOpacity
            style={{ flex: 2, marginRight: 16, justifyContent: 'flex-end', alignItems: 'flex-end' }}
            onPress={scanNfc}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24, height: 24, flex: 2, marginRight: 16 }} />
        )}
      </View>

      <SafeAreaView style={styles.contentContainer}>
        <MaterialIcons name="sensors" size={147} color="#fff" style={{ marginTop: 50 }} />
        <Text style={styles.contentTitle}>{nfcStatus}</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  navbar: {
    width: '100%',
    paddingTop: RNStatusBar.currentHeight ? RNStatusBar.currentHeight + 10 : 20,
    paddingBottom: 17,
    backgroundColor: '#F03824',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navbarTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: 'white',
    flex: 4,
  },
  mainContainer: {
    height: '100%',
    backgroundColor: "#000000",
  },
  contentContainer: {
    borderRadius: 10,
    backgroundColor: "#2c2c2c",
    borderColor: "#fff",
    borderWidth: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    margin: 10,
    flex: 1,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    width: '80%',
  },
});