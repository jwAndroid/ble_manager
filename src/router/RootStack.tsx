import {
   createNativeStackNavigator,
   NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React, { memo } from 'react';

import usePermission from '../plugins/usePermission';
import TransferScrn from '../screens/stacks/TransferScrn';
import TabRouter from './TabRouter';

export type ParamList = {
   TabRouter: undefined;
   Transfer: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<ParamList>;

const { Navigator, Screen } = createNativeStackNavigator<ParamList>();

const RootStack = () => {
   usePermission();

   return (
      <Navigator initialRouteName="TabRouter">
         <Screen name="TabRouter" component={TabRouter} options={{ headerShown: false }} />
         <Screen name="Transfer" component={TransferScrn} options={{ headerShown: false }} />
      </Navigator>
   );
};

export default memo(RootStack);
