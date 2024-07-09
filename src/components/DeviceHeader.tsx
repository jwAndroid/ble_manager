import React, { memo } from 'react';
import { Image, Text, View } from 'react-native';

const DeviceHeader = ({
   name,
   id,
   isConnected,
}: {
   name: string | undefined;
   id: string | undefined;
   isConnected: boolean;
}) => {
   return (
      <View
         style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 60,
            paddingHorizontal: 20,
            backgroundColor: '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: '#E0E0E0',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
         }}
      >
         <View>
            <Text style={{ fontSize: 12, color: '#333', fontWeight: '600' }}>{name ?? ''}</Text>
            <Text style={{ fontSize: 10, color: '#666' }}>{id ?? ''}</Text>
         </View>

         {isConnected ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <Image
                  source={require('../../assets/icons/connected.png')}
                  style={{ width: 24, height: 24, tintColor: 'blue' }}
                  tintColor="blue"
               />
            </View>
         ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <Image
                  source={require('../../assets/icons/disconnected.png')}
                  style={{ width: 24, height: 24, tintColor: '#F44336' }}
                  tintColor="#F44336"
               />
            </View>
         )}
      </View>
   );
};

export default memo(DeviceHeader);
