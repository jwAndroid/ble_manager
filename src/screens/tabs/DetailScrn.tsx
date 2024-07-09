import React, { memo, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import BleManager from 'react-native-ble-manager';

import { useGlobalState } from '../../plugins/GlobalState';
import DeviceHeader from '../../components/DeviceHeader';
import BluetoothDisconnectedScreen from '../../components/BluetoothDisconnectedScreen';

const DetailScrn = () => {
   const { device } = useGlobalState();

   const [peripheralInfo, setPeripheralInfo] = useState<any>();

   useEffect(() => {
      if (device && device.peripheralId) {
         const getConnectedPeripherals = async () => {
            const connectedPeripherals = await BleManager.getConnectedPeripherals();

            if (device?.peripheralId) {
               const retrieveServices = await BleManager.retrieveServices(device.peripheralId);

               setPeripheralInfo(connectedPeripherals.concat(retrieveServices));
            }
         };

         getConnectedPeripherals();
      }
   }, [device]);

   return (
      <View style={{ flex: 1, backgroundColor: '#1E1E1E' }}>
         <DeviceHeader
            name={device?.name}
            id={device?.peripheralId}
            isConnected={device?.isConnected ?? false}
         />

         {device?.isConnected ? (
            <ScrollView contentContainerStyle={{ backgroundColor: '#1E1E1E', padding: 20 }}>
               <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: '#00FF00', fontWeight: '500' }}>
                     {JSON.stringify(peripheralInfo, null, 5)}
                  </Text>
               </View>
            </ScrollView>
         ) : (
            <BluetoothDisconnectedScreen />
         )}
      </View>
   );
};

export default memo(DetailScrn);
