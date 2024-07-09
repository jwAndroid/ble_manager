import React, { memo, useEffect, useState } from 'react';
import {
   FlatList,
   NativeEventEmitter,
   NativeModules,
   Pressable,
   SafeAreaView,
   Text,
   TouchableHighlight,
   View,
} from 'react-native';
import BleManager, {
   BleDisconnectPeripheralEvent,
   BleManagerDidUpdateValueForCharacteristicEvent,
   BleScanCallbackType,
   BleScanMatchMode,
   BleScanMode,
   Peripheral,
   PeripheralInfo,
} from 'react-native-ble-manager';
import { styles } from '../src/styles/scan-devices-scrn';

const SECONDS_TO_SCAN_FOR = 1;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATES = true;

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

function sleep(ms: number) {
   return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

declare module 'react-native-ble-manager' {
   interface Peripheral {
      connected?: boolean;
      connecting?: boolean;
   }
}

const ScanDevicesScrn = () => {
   const [isScanning, setIsScanning] = useState(false);
   const [peripherals, setPeripherals] = useState(new Map<Peripheral['id'], Peripheral>());

   const startScan = () => {
      if (!isScanning) {
         setPeripherals(new Map<Peripheral['id'], Peripheral>());

         try {
            console.debug('[startScan] starting scan...');
            setIsScanning(true);
            BleManager.scan(SERVICE_UUIDS, SECONDS_TO_SCAN_FOR, ALLOW_DUPLICATES, {
               matchMode: BleScanMatchMode.Sticky,
               scanMode: BleScanMode.LowLatency,
               callbackType: BleScanCallbackType.AllMatches,
            })
               .then(() => {
                  console.debug('[startScan] scan promise returned successfully.');
               })
               .catch((err: any) => {
                  console.error('[startScan] ble scan returned in error', err);
               });
         } catch (error) {
            console.error('[startScan] ble scan error thrown', error);
         }
      }
   };

   const handleStopScan = () => {
      setIsScanning(false);
      console.debug('[handleStopScan] scan is stopped.');
   };

   const handleDisconnectedPeripheral = (event: BleDisconnectPeripheralEvent) => {
      console.debug(`[handleDisconnectedPeripheral][${event.peripheral}] disconnected.`);

      setPeripherals((map) => {
         let p = map.get(event.peripheral);
         if (p) {
            p.connected = false;
            return new Map(map.set(event.peripheral, p));
         }
         return map;
      });
   };

   const handleConnectPeripheral = (event: any) => {
      console.log(`[handleConnectPeripheral][${event.peripheral}] connected.`);
   };

   const handleUpdateValueForCharacteristic = (
      data: BleManagerDidUpdateValueForCharacteristicEvent,
   ) => {
      console.log('응답 데이터 입니다! =', data.value);
   };

   const handleDiscoverPeripheral = (peripheral: Peripheral) => {
      console.debug('[handleDiscoverPeripheral] new BLE peripheral=', peripheral);
      if (!peripheral.name) {
         peripheral.name = 'NO NAME';
      }
      setPeripherals((map) => {
         return new Map(map.set(peripheral.id, peripheral));
      });
   };

   const togglePeripheralConnection = async (peripheral: Peripheral) => {
      if (peripheral && peripheral.connected) {
         try {
            await BleManager.disconnect(peripheral.id);
         } catch (error) {
            console.error(
               `[togglePeripheralConnection][${peripheral.id}] error when trying to disconnect device.`,
               error,
            );
         }
      } else {
         await connectPeripheral(peripheral);
      }
   };

   const retrieveConnected = async () => {
      try {
         const connectedPeripherals = await BleManager.getConnectedPeripherals();
         if (connectedPeripherals.length === 0) {
            console.warn('[retrieveConnected] No connected peripherals found.');
            return;
         }

         console.debug(
            '[retrieveConnected]',
            connectedPeripherals.length,
            'connectedPeripherals',
            connectedPeripherals,
         );

         for (let peripheral of connectedPeripherals) {
            setPeripherals((map) => {
               let p = map.get(peripheral.id);
               if (p) {
                  p.connected = true;
                  return new Map(map.set(p.id, p));
               }
               return map;
            });
         }
      } catch (error) {
         console.error('[retrieveConnected] unable to retrieve connected peripherals.', error);
      }
   };

   const retrieveServices = async () => {
      const peripheralInfos: PeripheralInfo[] = [];
      for (let [peripheralId, peripheral] of peripherals) {
         if (peripheral.connected) {
            const newPeripheralInfo = await BleManager.retrieveServices(peripheralId);
            peripheralInfos.push(newPeripheralInfo);
         }
      }
      return peripheralInfos;
   };

   const readCharacteristics = async () => {
      let services = await retrieveServices();

      for (let peripheralInfo of services) {
         peripheralInfo.characteristics?.forEach(async (c) => {
            try {
               const value = await BleManager.read(peripheralInfo.id, c.service, c.characteristic);
               console.log(
                  '[readCharacteristics]',
                  'peripheralId',
                  peripheralInfo.id,
                  'service',
                  c.service,
                  'char',
                  c.characteristic,
                  '\n\tvalue',
                  value,
               );
            } catch (error) {
               console.error('[readCharacteristics]', 'Error reading characteristic', error);
            }
         });
      }
   };

   const connectPeripheral = async (peripheral: Peripheral) => {
      try {
         if (isScanning) {
            await BleManager.stopScan();
         }

         if (peripheral) {
            setPeripherals((map) => {
               let p = map.get(peripheral.id);
               if (p) {
                  p.connecting = true;
                  return new Map(map.set(p.id, p));
               }
               return map;
            });

            await BleManager.connect(peripheral.id);
            console.debug(`[connectPeripheral][${peripheral.id}] connected.`);

            setPeripherals((map) => {
               let p = map.get(peripheral.id);
               if (p) {
                  p.connecting = false;
                  p.connected = true;
                  return new Map(map.set(p.id, p));
               }
               return map;
            });

            await sleep(900);

            const peripheralData = await BleManager.retrieveServices(peripheral.id);

            console.debug(
               `[connectPeripheral][${peripheral.id}] retrieved peripheral services`,
               JSON.stringify(peripheralData),
            );

            console.log('notify 를 검색합니다.');
            const notifyProperty = peripheralData.characteristics?.find((c) => c.properties.Notify);

            if (notifyProperty) {
               console.log(
                  'notify 를 검색이 완료되었습니다. startNotification 을 시작합니다. [notifyProperty]: ',
                  notifyProperty,
               );
               await BleManager.startNotification(
                  peripheral.id,
                  notifyProperty.service,
                  notifyProperty.characteristic,
               );
               console.log('startNotification 성공');
            }

            console.log('write 를 검색합니다.');
            const writeProperty = peripheralData.characteristics?.find((c) => c.properties.Write);

            if (writeProperty) {
               console.log('write 검색이 완료되었습니다. [writeProperty]: ', writeProperty);
            }

            setPeripherals((map) => {
               let p = map.get(peripheral.id);
               if (p) {
                  return new Map(map.set(p.id, p));
               }
               return map;
            });

            const rssi = await BleManager.readRSSI(peripheral.id);

            console.debug(
               `[connectPeripheral][${peripheral.id}] retrieved current RSSI value: ${rssi}.`,
            );

            if (peripheralData.characteristics) {
               for (let characteristic of peripheralData.characteristics) {
                  if (characteristic.descriptors) {
                     for (let descriptor of characteristic.descriptors) {
                        try {
                           let data = await BleManager.readDescriptor(
                              peripheral.id,
                              characteristic.service,
                              characteristic.characteristic,
                              descriptor.uuid,
                           );
                           console.debug(
                              `[connectPeripheral][${peripheral.id}] ${characteristic.service} ${characteristic.characteristic} ${descriptor.uuid} descriptor read as:`,
                              data,
                           );
                        } catch (error) {
                           console.error(
                              `[connectPeripheral][${peripheral.id}] failed to retrieve descriptor ${descriptor} for characteristic ${characteristic}:`,
                              error,
                           );
                        }
                     }
                  }
               }
            }

            setPeripherals((map) => {
               let p = map.get(peripheral.id);
               if (p) {
                  p.rssi = rssi;
                  return new Map(map.set(p.id, p));
               }
               return map;
            });
         }
      } catch (error) {
         console.error(`[connectPeripheral][${peripheral.id}] connectPeripheral error`, error);
      }
   };

   useEffect(() => {
      try {
         BleManager.start({ showAlert: false })
            .then(() => {
               console.debug('BleManager started.');
            })
            .catch((error: any) => console.error('BeManager could not be started.', error));
      } catch (error) {
         console.error('unexpected error starting BleManager.', error);
         return;
      }

      const listeners = [
         bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral),
         bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan),
         bleManagerEmitter.addListener(
            'BleManagerDisconnectPeripheral',
            handleDisconnectedPeripheral,
         ),
         bleManagerEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            handleUpdateValueForCharacteristic,
         ),
         bleManagerEmitter.addListener('BleManagerConnectPeripheral', handleConnectPeripheral),
      ];

      return () => {
         console.debug('[app] main component unmounting. Removing listeners...');

         for (const listener of listeners) {
            listener.remove();
         }
      };
   }, []);

   const renderItem = ({ item }: { item: Peripheral }) => {
      return (
         <TouchableHighlight onPress={() => togglePeripheralConnection(item)}>
            <View
               style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '',
                  borderWidth: 0.3,
                  borderColor: 'gray',
               }}
            >
               <Text style={{ fontSize: 14, color: 'black', fontWeight: '700' }}>
                  Name:{item.name}
                  {item.connecting && ' - Connecting...'}
               </Text>

               <Text style={{ fontSize: 14, color: 'black', fontWeight: '700' }}>
                  LocalName: {item?.advertising?.localName ?? 'unknown'}
               </Text>

               <Text style={{ fontSize: 14, color: 'black', fontWeight: '700' }}>
                  RSSI: {item.rssi}
               </Text>

               <Text style={{ fontSize: 14, color: 'black', fontWeight: '700' }}>
                  Peripheral ID: {item.id}
               </Text>
            </View>
         </TouchableHighlight>
      );
   };

   const onPress = async () => {
      const peripheralId = '74:4D:BD:70:05:3A';
      const serviceUUID = 'abf0';
      const characteristicUUID = 'abf1';
      const data = [97];
      const maxByteSize = 20;

      await BleManager.write(peripheralId, serviceUUID, characteristicUUID, data, maxByteSize);
   };

   const onDisconnect = async () => {
      const peripheralId = '74:4D:BD:70:05:3A';
      await BleManager.disconnect(peripheralId);
   };

   const startNotification = async () => {
      const characteristicId = 'abf1';
      const peripheralId = '74:4D:BD:70:05:3A';
      const serviceUUID = 'abf0';
      await BleManager.startNotification(peripheralId, serviceUUID, characteristicId);
   };

   return (
      <SafeAreaView style={{ flex: 1 }}>
         <View style={styles.buttonGroup}>
            <Pressable style={styles.scanButton} onPress={startScan}>
               <Text style={styles.scanButtonText}>
                  {isScanning ? 'Scanning...' : 'Scan Bluetooth'}
               </Text>
            </Pressable>

            <Pressable style={styles.scanButton} onPress={retrieveConnected}>
               <Text style={styles.scanButtonText} lineBreakMode="middle">
                  {'Retrieve'}
               </Text>
            </Pressable>

            <Pressable style={styles.scanButton} onPress={readCharacteristics}>
               <Text style={styles.scanButtonText}>characteristics</Text>
            </Pressable>

            <Pressable style={styles.scanButton} onPress={onPress}>
               <Text style={styles.scanButtonText}>TransferScrn</Text>
            </Pressable>

            <Pressable style={styles.scanButton} onPress={onDisconnect}>
               <Text style={styles.scanButtonText}>Disconnect</Text>
            </Pressable>

            <Pressable style={styles.scanButton} onPress={startNotification}>
               <Text style={styles.scanButtonText}>startNotification</Text>
            </Pressable>
         </View>

         <FlatList
            data={Array.from(peripherals.values())}
            contentContainerStyle={{ rowGap: 12 }}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator
         />
      </SafeAreaView>
   );
};

export default memo(ScanDevicesScrn);
