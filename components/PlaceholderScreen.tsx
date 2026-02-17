import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PlaceholderScreen({ name }: { name: string }) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{name} Screen</Text>
            <Text style={{ color: '#666', marginTop: 10 }}>Coming Soon</Text>
        </View>
    );
}
