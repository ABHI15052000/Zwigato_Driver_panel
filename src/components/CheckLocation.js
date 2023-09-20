import { View, Text, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import NetInfo from "@react-native-community/netinfo";
import { Snackbar } from "react-native-paper";
const CheckLocation = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const renderSnackbar = () => (
    <Snackbar visible={!isConnected} onDismiss={() => setShow(false)}>
      No internet connection. Please turn on your internet.
    </Snackbar>
  );

  const openGPSSettings = async () => {
    if (
      RNAndroidLocationEnabler &&
      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded
    ) {
      try {
        await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
          interval: 10000,
          fastInterval: 5000,
        });
        // console.log('GPS is enabled');
        // Location permissions granted and GPS is enabled, you can now access the phone's location
      } catch (error) {
        // console.log('Failed to enable GPS');
        // Handle the error scenario
      }
    } else {
      // console.log('RNAndroidLocationEnabler is not available');
      // Handle the case where the module is not available
    }
  };

  const checkLocationAvailability = async () => {
    try {
      await RNAndroidLocationEnabler.checkIfLocationAvailable();
    } catch (error) {
      openGPSSettings();
    }
  };

  useEffect(() => {
    const interval = setInterval(checkLocationAvailability, 5000); // Check every 5 seconds

    return () => {
      clearInterval(interval); // Clear the interval when the component unmounts
    };
  }, []);

  useEffect(() => {
    const checkLocationPermissions = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.log(
            "Permission to access location denied",
            "Please provide location access to get accurate location",
            [
              {
                text: "OK",
                onPress: () => checkLocationPermissions(),
              },
            ]
          );
          return;
        }

        let backgroundPermissions =
          await Location.requestBackgroundPermissionsAsync();

        if (backgroundPermissions.status === "granted") {
          // console.log('Permission to access location granted');
          // Location permissions granted, you can now access the phone's location
        } else {
          console.log("Permission to access location denied");
          // Handle the case where background permissions were not granted
        }
      } catch (error) {
        console.log("Error requesting location permissions:", error);
        // Handle the error scenario
      }
    };

    checkLocationPermissions();
  }, []);
  return <View>{renderSnackbar()}</View>;
};

export default CheckLocation;
