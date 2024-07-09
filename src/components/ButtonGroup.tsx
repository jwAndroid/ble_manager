import { View, Text, Pressable } from 'react-native';
import React from 'react';

const ButtonGroup = ({
   isScanning,
   startScan,
   onDisconnect,
}: {
   isScanning: boolean;
   startScan: () => void;
   onDisconnect: () => void;
}) => {
   return (
      <View
         style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 20,
            marginBottom: 10,
            marginHorizontal: 10,
         }}
      >
         <Pressable
            style={({ pressed }) => [
               {
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 8,
                  backgroundColor: pressed ? '#1E88E5' : '#2196F3',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  marginRight: 4,
               },
            ]}
            onPress={startScan}
         >
            <Text
               style={{
                  fontSize: 16,
                  color: '#FFFFFF',
                  fontWeight: '600',
               }}
            >
               {isScanning ? '스캔중..' : '스캔'}
            </Text>
         </Pressable>

         <Pressable
            style={({ pressed }) => [
               {
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 8,
                  backgroundColor: pressed ? '#D32F2F' : '#F44336',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  marginLeft: 4,
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

export default ButtonGroup;
