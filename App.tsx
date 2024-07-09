import { NavigationContainer } from '@react-navigation/native';
import React, { memo } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GlobalStateProvider } from './src/plugins/GlobalState';
import RootStack from './src/router/RootStack';

const App = () => {
   return (
      <GlobalStateProvider>
         <NavigationContainer>
            <SafeAreaProvider>
               <SafeAreaView style={{ flex: 1 }}>
                  <RootStack />
               </SafeAreaView>
            </SafeAreaProvider>
         </NavigationContainer>
      </GlobalStateProvider>
   );
};

export default memo(App);
