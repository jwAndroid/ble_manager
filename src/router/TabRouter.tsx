import { BottomTabNavigationProp, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image } from 'react-native';
import DetailScrn from '../screens/tabs/DetailScrn';
import ScanDevicesScrn from '../screens/tabs/ScanDevicesScrn';
import MessageScrn from '../screens/tabs/MessageScrn';

export type RouterModel = {
   ScanDevices: undefined;
   Detail: undefined;
   Message: undefined;
};

const { Navigator, Screen } = createBottomTabNavigator();

export type TabNavigationProps = BottomTabNavigationProp<RouterModel>;

const TabRouter = () => {
   return (
      <Navigator
         screenOptions={() => ({
            tabBarActiveTintColor: 'skyblue',
            tabBarInactiveTintColor: 'gray',
            tabBarLabelStyle: { fontSize: 10, fontWeight: 'bold' },
            tabBarStyle: {
               height: 58,
               paddingTop: 6,
               paddingBottom: 4,
            },
         })}
      >
         <Screen
            name="ScanDevices"
            component={ScanDevicesScrn}
            options={{
               headerShown: false,
               tabBarLabel: 'SCAN',
               tabBarIcon: ({ color, size }) => {
                  return (
                     <Image
                        source={require('../../assets/icons/ble.png')}
                        style={{
                           width: size,
                           height: size,
                           tintColor: color,
                        }}
                     />
                  );
               },
            }}
         />
         <Screen
            name="Detail"
            component={DetailScrn}
            options={{
               headerShown: false,
               tabBarLabel: 'DETAIL',
               tabBarIcon: ({ color, size }) => {
                  return (
                     <Image
                        source={require('../../assets/icons/info.png')}
                        style={{
                           width: size,
                           height: size,
                           tintColor: color,
                        }}
                     />
                  );
               },
            }}
         />
         <Screen
            name="Message"
            component={MessageScrn}
            options={{
               headerShown: false,
               tabBarLabel: 'Message',
               tabBarIcon: ({ color, size }) => {
                  return (
                     <Image
                        source={require('../../assets/icons/send.png')}
                        style={{
                           width: size,
                           height: size,
                           tintColor: color,
                        }}
                     />
                  );
               },
            }}
         />
      </Navigator>
   );
};

export default TabRouter;
