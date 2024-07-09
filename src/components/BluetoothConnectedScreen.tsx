import React from 'react';
import { View, Text, Pressable } from 'react-native';

const BluetoothConnectedScreen = ({ onDisconnect }: { onDisconnect: () => void }) => {
   return (
      <View
         style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            backgroundColor: '#F5F5F5',
         }}
      >
         <Text
            style={{
               fontSize: 24,
               fontWeight: 'bold',
               marginBottom: 20,
               color: '#2196F3',
               textAlign: 'center',
            }}
         >
            블루투스 연결됨
         </Text>
         <Text
            style={{
               fontSize: 16,
               color: '#666',
               textAlign: 'center',
               marginBottom: 40,
               fontWeight: '500',
            }}
         >
            장치가 블루투스에 성공적으로 연결되었습니다.
         </Text>
         <Pressable
            style={({ pressed }) => [
               {
                  paddingVertical: 12,
                  paddingHorizontal: 40,
                  borderRadius: 8,
                  backgroundColor: pressed ? '#D32F2F' : '#F44336',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
               },
            ]}
            onPress={onDisconnect}
         >
            <Text
               style={{
                  fontSize: 16,
                  color: '#FFFFFF',
                  fontWeight: '600',
               }}
            >
               연결해제
            </Text>
         </Pressable>
      </View>
   );
};

export default BluetoothConnectedScreen;
