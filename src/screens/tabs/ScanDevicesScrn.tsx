import React, { memo, useEffect, useState } from 'react';
import {
   Alert,
   FlatList,
   NativeEventEmitter,
   NativeModules,
   Text,
   TouchableOpacity,
   View,
} from 'react-native';
import BleManager, {
   BleDisconnectPeripheralEvent,
   BleScanCallbackType,
   BleScanMatchMode,
   BleScanMode,
   Peripheral,
} from 'react-native-ble-manager';
import BluetoothConnectedScreen from '../../components/BluetoothConnectedScreen';
import ButtonGroup from '../../components/ButtonGroup';
import DeviceHeader from '../../components/DeviceHeader';
import { useGlobalState } from '../../plugins/GlobalState';
import LoadingModal from '../../components/LoadingModal';

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
   const { device, setDevice, reset } = useGlobalState();

   const [isScanning, setIsScanning] = useState(false);
   const [peripherals, setPeripherals] = useState(new Map<Peripheral['id'], Peripheral>());
   const [isLoading, setIsLoading] = useState(false);

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
      reset();

      console.debug(`[handleDisconnectedPeripheral][${event.peripheral}] disconnected.`);

      setIsLoading(false);
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

   const connectPeripheral = async (peripheral: Peripheral) => {
      try {
         setIsLoading(true);

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

            setDevice({
               isConnected: true,
               name: peripheral.name || peripheral.advertising.localName || 'None',
               peripheralId: peripheral.id,
               properties: {
                  notify: {
                     characteristic: notifyProperty?.characteristic ?? '',
                     service: notifyProperty?.service ?? '',
                  },
                  write: {
                     characteristic: writeProperty?.characteristic ?? '',
                     service: writeProperty?.service ?? '',
                  },
               },
            });

            setPeripherals((map) => {
               let p = map.get(peripheral.id);
               if (p) {
                  p.rssi = rssi;
                  return new Map(map.set(p.id, p));
               }
               return map;
            });

            setIsLoading(false);
         }
      } catch (error) {
         Alert.alert(
            'Bluetooth Disconnected',
            'Your device is not connected to Bluetooth. Please ensure Bluetooth is enabled and try again.' +
               error,
            [{ text: 'OK' }],
            { cancelable: false },
         );

         console.error(`[connectPeripheral][${peripheral.id}] connectPeripheral error`, error);
      }
   };

   useEffect(() => {
      try {
         BleManager.start({ showAlert: false })
            .then(() => {
               startScan();
            })
            .catch((error: any) => console.error('BeManager could not be started.', error));
      } catch (error) {
         console.error('unexpected error starting BleManager.', error);
         return;
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => {
      const listeners = [
         bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral),
         bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan),
         bleManagerEmitter.addListener(
            'BleManagerDisconnectPeripheral',
            handleDisconnectedPeripheral,
         ),
         bleManagerEmitter.addListener('BleManagerConnectPeripheral', handleConnectPeripheral),
      ];

      return () => {
         console.debug('[app] main component unmounting. Removing listeners...');

         for (const listener of listeners) {
            listener.remove();
         }
      };

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const renderItem = ({ item }: { item: Peripheral }) => {
      return (
         <TouchableOpacity onPress={() => togglePeripheralConnection(item)}>
            <View
               style={{
                  padding: 16,
                  margin: 8,
                  borderRadius: 8,
                  backgroundColor: '#f9f9f9',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
               }}
            >
               <Text
                  style={{
                     fontSize: 16,
                     color: item.name === 'NO NAME' ? 'gray' : 'blue',
                     fontWeight: '700',
                     marginBottom: 4,
                  }}
               >
                  Name: {item.name}
                  {item.connecting && ' - Connecting...'}
               </Text>

               <Text style={{ fontSize: 14, color: 'black', marginBottom: 4 }}>
                  LocalName: {item?.advertising?.localName ?? 'unknown'}
               </Text>

               <Text style={{ fontSize: 14, color: 'black', marginBottom: 4 }}>
                  RSSI: {item.rssi}
               </Text>

               <Text style={{ fontSize: 12, color: 'black' }}>Peripheral ID: {item.id}</Text>
            </View>
         </TouchableOpacity>
      );
   };

   const onDisconnect = async () => {
      if (device?.peripheralId) {
         await BleManager.disconnect(device.peripheralId);
      }
   };

   useEffect(() => {
      let loadingTimeout: NodeJS.Timeout;

      if (isLoading) {
         loadingTimeout = setTimeout(() => {
            setIsLoading(false);
            Alert.alert(
               'Connection Failed',
               'Failed to connect to the device. Please try again.',
               [
                  {
                     text: 'OK',
                     onPress: () => {
                        setPeripherals((map) => {
                           const newMap = new Map(map);
                           newMap.forEach((p) => {
                              if (p.connecting) {
                                 p.connecting = false;
                              }
                           });
                           return newMap;
                        });
                     },
                  },
               ],
               { cancelable: false },
            );
         }, 10000);
      }

      return () => {
         clearTimeout(loadingTimeout);
      };
   }, [isLoading]);

   return (
      <View style={{ flex: 1 }}>
         <DeviceHeader
            name={device?.name}
            id={device?.peripheralId}
            isConnected={device?.isConnected ?? false}
         />

         {!device?.isConnected ? (
            <>
               <ButtonGroup
                  isScanning={isScanning}
                  onDisconnect={onDisconnect}
                  startScan={startScan}
               />

               <FlatList
                  data={Array.from(peripherals.values())}
                  contentContainerStyle={{ rowGap: 12 }}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator
               />

               <LoadingModal visible={isLoading} />
            </>
         ) : (
            <BluetoothConnectedScreen onDisconnect={onDisconnect} />
         )}
      </View>
   );
};

export default memo(ScanDevicesScrn);
