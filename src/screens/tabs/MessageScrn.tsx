import { useNavigation } from '@react-navigation/core';
import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import BluetoothDisconnectedScreen from '../../components/BluetoothDisconnectedScreen';
import DeviceHeader from '../../components/DeviceHeader';
import { useGlobalState } from '../../plugins/GlobalState';
import { RootStackNavigationProp } from '../../router/RootStack';

declare module 'react-native-ble-manager' {
   interface Peripheral {
      connected?: boolean;
      connecting?: boolean;
   }
}

const MessageScrn = () => {
   const nav = useNavigation<RootStackNavigationProp>();

   const { device } = useGlobalState();

   return (
      <View style={{ flex: 1 }}>
         <DeviceHeader
            name={device?.name}
            id={device?.peripheralId}
            isConnected={device?.isConnected ?? false}
         />

         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {device?.isConnected ? (
               <Pressable
                  style={{
                     // width: '100%',
                     paddingVertical: 20,
                     paddingHorizontal: 60,
                     // paddingHorizontal: 24,
                     borderRadius: 8,
                     backgroundColor: '#2196F3',
                     alignItems: 'center',
                     shadowColor: '#000',
                     shadowOffset: { width: 0, height: 2 },
                     shadowOpacity: 0.1,
                     shadowRadius: 6,
                     elevation: 3,
                  }}
                  onPress={() => nav.navigate('Transfer')}
               >
                  <Text style={{ fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' }}>
                     TEST START
                  </Text>
               </Pressable>
            ) : (
               <BluetoothDisconnectedScreen />
            )}
         </View>
      </View>
   );
};

export default memo(MessageScrn);
