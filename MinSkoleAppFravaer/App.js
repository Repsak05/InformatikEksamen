import React, { useState, useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

export default function App() {

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