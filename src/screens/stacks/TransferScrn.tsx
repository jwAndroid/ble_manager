import React, { memo, useEffect, useState, useRef } from 'react';
import {
   FlatList,
   NativeEventEmitter,
   NativeModules,
   Pressable,
   Text,
   TextInput,
   View,
   StyleSheet,
   Alert,
} from 'react-native';
import BleManager, {
   BleManagerDidUpdateValueForCharacteristicEvent,
} from 'react-native-ble-manager';

import { useGlobalState } from '../../plugins/GlobalState';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const TransferScrn = () => {
   const { device } = useGlobalState();
   const [data, setData] = useState<any[]>([]);
   const [inputValue, setInputValue] = useState<string>('');
   const [averageElapsedTime, setAverageElapsedTime] = useState<number | null>(null);
   const [averageElapsedTimeSeconds, setAverageElapsedTimeSeconds] = useState<number | null>(null);
   const startTimeRef = useRef<number | null>(null);
   const flatListRef = useRef<FlatList<any>>(null); // FlatList ref 생성

   const calculateAverageElapsedTime = (times: number[]) => {
      const sum = times.reduce((acc, time) => acc + time, 0);
      return sum / times.length;
   };

   const handleUpdateValueForCharacteristic = (
      response: BleManagerDidUpdateValueForCharacteristicEvent,
   ) => {
      const endTime = performance.now();
      const startTime = startTimeRef.current;
      let elapsedTime = null;
      let elapsedTimeSeconds = null;

      if (startTime !== null) {
         elapsedTime = endTime - startTime;
         elapsedTimeSeconds = elapsedTime / 1000; // Convert milliseconds to seconds
         startTimeRef.current = null;
      }

      const decimalValue = response.value;
      const stringValue = String.fromCharCode(...response.value);

      console.log('응답 데이터 입니다! =', decimalValue);
      console.log('응답 데이터 (문자열) =', stringValue);
      console.log('응답 시간 (마이크로초) =', elapsedTime);
      console.log('응답 지연 시간 (초) =', elapsedTimeSeconds);

      setData((prevData) => {
         const newData = [
            { decimalValue, stringValue, elapsedTime, elapsedTimeSeconds },
            ...prevData,
         ];
         if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true }); // 스크롤 맨 위로 이동
         }
         const times = newData
            .map((item) => item.elapsedTime)
            .filter((time) => time !== null) as number[];
         setAverageElapsedTime(calculateAverageElapsedTime(times));

         const timesSeconds = newData
            .map((item) => item.elapsedTimeSeconds)
            .filter((time) => time !== null) as number[];
         setAverageElapsedTimeSeconds(calculateAverageElapsedTime(timesSeconds));

         return newData;
      });

      setInputValue('');
   };

   useEffect(() => {
      const listeners = [
         bleManagerEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            handleUpdateValueForCharacteristic,
         ),
      ];

      return () => {
         for (const listener of listeners) {
            listener.remove();
         }
      };

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const onPress = async () => {
      try {
         if (device && device.peripheralId && device.properties && inputValue) {
            const payload = inputValue.split('').map((char) => char.charCodeAt(0));
            startTimeRef.current = performance.now();

            await BleManager.write(
               device.peripheralId,
               device.properties.write.service,
               device.properties.write.characteristic,
               payload,
               20,
            );
         }
      } catch (error) {
         Alert.alert(
            'Connection Failed',
            'Failed to connect to the device. Please try again.',
            [
               {
                  text: 'OK',
                  onPress: () => {},
               },
            ],
            { cancelable: false },
         );
      }
   };

   const renderItem = ({ item }: { item: any }) => {
      return (
         <View style={styles.listItem}>
            <Text style={styles.listItemText}>10진수 값: {JSON.stringify(item.decimalValue)}</Text>
            <Text style={styles.listItemText}>문자열 값: {item.stringValue}</Text>
            {item.elapsedTime !== null && (
               <Text style={styles.listItemText}>
                  응답 시간:{' '}
                  <Text style={{ color: '#4A90E2', fontSize: 14, fontWeight: 'bold' }}>
                     {item.elapsedTime.toFixed(3)}
                  </Text>{' '}
                  ms
               </Text>
            )}
            {item.elapsedTimeSeconds !== null && (
               <Text style={styles.listItemText}>
                  응답 지연 시간:{' '}
                  <Text style={{ color: '#4A90E2', fontSize: 14, fontWeight: 'bold' }}>
                     {item.elapsedTimeSeconds.toFixed(6)}
                  </Text>{' '}
                  s
               </Text>
            )}
         </View>
      );
   };

   return (
      <View style={styles.container}>
         <View style={styles.inputContainer}>
            <TextInput
               style={styles.input}
               placeholder="문자열 입력 (예: abc)"
               placeholderTextColor="#888"
               value={inputValue}
               onChangeText={setInputValue}
               onSubmitEditing={onPress}
               autoCapitalize="none"
            />

            <Pressable style={styles.button} onPress={onPress}>
               <Text style={styles.buttonText}>SEND</Text>
            </Pressable>
         </View>

         <View style={{ flex: 1 }}>
            <FlatList
               ref={flatListRef} // FlatList ref 연결
               data={data}
               renderItem={renderItem}
               keyExtractor={(_, index) => index.toString()}
            />
         </View>

         {averageElapsedTime !== null && (
            <View style={styles.averageContainer}>
               <Text style={styles.averageText}>
                  평균 응답 시간:{' '}
                  <Text style={{ color: '#4A90E2', fontSize: 14, fontWeight: 'bold' }}>
                     {averageElapsedTime.toFixed(3)}
                  </Text>{' '}
                  ms
               </Text>

               <Text style={styles.averageText}>
                  평균 응답 지연 시간:{' '}
                  <Text style={{ color: '#4A90E2', fontSize: 14, fontWeight: 'bold' }}>
                     {averageElapsedTimeSeconds?.toFixed(6)}
                  </Text>{' '}
                  s
               </Text>
            </View>
         )}
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#1E1E1E',
      padding: 16,
   },
   inputContainer: {
      flexDirection: 'row',
      marginBottom: 16,
   },
   input: {
      flex: 1,
      height: 50,
      borderColor: '#555',
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 10,
      color: 'white',
      marginRight: 10,
   },
   button: {
      width: 100,
      height: 50,
      backgroundColor: '#007BFF',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 4,
   },
   buttonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
   },
   listItem: {
      padding: 10,
      borderBottomColor: '#333',
      borderBottomWidth: 1,
   },
   listItemText: {
      color: 'white',
      fontSize: 12,
   },
   averageContainer: {
      padding: 10,
      backgroundColor: '#333',
      alignItems: 'center',
   },
   averageText: {
      color: 'white',
      fontSize: 14,
   },
});

export default memo(TransferScrn);
