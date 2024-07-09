import { useNavigation } from '@react-navigation/core';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { TabNavigationProps } from '../router/TabRouter';

const BluetoothDisconnectedScreen = () => {
   const nav = useNavigation<TabNavigationProps>();

   const onRetry = () => {
      nav.navigate('ScanDevices');
   };

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
               color: '#F44336',
               textAlign: 'center',
            }}
         >
            블루투스 연결 끊김
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
            귀하의 장치가 블루투스에 연결되어 있지 않습니다. 블루투스가 활성화되어 있는지 확인하고
            다시 시도하십시오.
         </Text>

         <Pressable
            style={({ pressed }) => [
               {
                  paddingVertical: 12,
                  paddingHorizontal: 40,
                  borderRadius: 8,
                  backgroundColor: pressed ? '#1E88E5' : '#2196F3',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
               },
            ]}
            onPress={onRetry}
         >
            <Text
               style={{
                  fontSize: 16,
                  color: '#FFFFFF',
                  fontWeight: '600',
               }}
            >
               연결하기
            </Text>
         </Pressable>
      </View>
   );
};

export default BluetoothDisconnectedScreen;
