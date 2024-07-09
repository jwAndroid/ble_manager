import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';

const LoadingModal = ({ visible }: { visible: boolean }) => {
   return (
      <Modal transparent={true} animationType="fade" visible={visible}>
         <View style={styles.container}>
            <View style={styles.background} />

            <View style={styles.loaderContainer}>
               <ActivityIndicator size="large" color="#2196F3" />
               {/* <Text style={styles.loadingText}>Connecting...</Text> */}
            </View>
         </View>
      </Modal>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
   background: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
   },
   loaderContainer: {
      justifyContent: 'center',
      alignItems: 'center',
   },
   loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#000',
   },
});

export default LoadingModal;
