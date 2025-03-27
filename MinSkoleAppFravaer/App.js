import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';

export default function App() {

  const [newId, setNewId] = useState("");
  const [theId, setTheId] = useState("");

  function addId(id){
    setTheId(id);
    console.log("Adding", id, "to DB");
    //add value to db
  }

  return (
    <View>
      <Text>WOW - MinSkoleApp</Text>
      
      <TextInput
        onChangeText={(text) => setNewId(text)}
        value={newId} 
        placeholder="Type ID to add..."
      />

      <Button
        onPress = {() => addId(newId)}
        title = "Tilføj ID"
      />

      <Text> Current id's</Text>
      {theId && (
        <Text>{theId}</Text>
      )}

      <StatusBar style="auto" />
    </View>
  );
}
