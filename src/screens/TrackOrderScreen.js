import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import Mapbox from '@rnmapbox/maps';
import BottomSheetContents from "./BottomSheetContents";
//import BottomSheet from "react-native-simple-bottom-sheet";
import styled from "styled-components/native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Titlebar from "../components/TitileBar";
// import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CheckLocation from './../components/CheckLocation';
import BottomSheet from "../components/BottomSheet";
import AsyncStorage from "@react-native-async-storage/async-storage";



const SBView = styled.View`
  flex-direction:row;
  margin:10px;
  padding:10px;
  border:1px;
  border-color:white;
  border-radius:8px;
  background-color:white;
  elevation:5;
`;

const TrackOrderScreen = ({ route }) => {
  const { pick_up, deliver_to, orderId, name, photo, phone, pick_up_lat, pick_up_long, delivery_lat, delivery_longitude, distance, pickup_status } = route.params;
  const navigation = useNavigation();

  const [driverPhoto, setDriverPhoto] = useState("");
  const [carNumber, setCarNumber] = useState("ABC-123");
  const [pickupLocation, setPickupLocation] = useState("123 Main Street");
  const [dropLocation, setDropLocation] = useState("456 Park Avenue");
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    getMapToken();
  }, [])
  const getMapToken = async () => {
    const mapkey = await AsyncStorage.getItem('mapboxToken');
    // console.log('mapkey', mapkey);
    Mapbox.setWellKnownTileServer('Mapbox');
    Mapbox.setAccessToken(mapkey);
  }


  const bottomSheetRef = useRef(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  useEffect(() => {
    bottomSheetRef.current?.expand(); // Open the bottom sheet when the user comes to the screen
    return () => {
      bottomSheetRef.current?.collapse();
    };
  }, []);
  // variables
  const snapPoints = useMemo(() => ["60%", "70%"], []);

  // callbacks
  const handleSheetChanges = useCallback((index) => {
    // console.log('handleSheetChanges', index);
  }, []);
  useEffect(() => {
    bottomSheetRef.current?.expand();
    return () => {
      bottomSheetRef.current?.collapse();
    };
  }, []);




  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.titleBarContainer}>
        <Titlebar title="Track Order" />
      </View>

      <View style={styles.container}>

        <Mapbox.MapView style={styles.map}>
          <Mapbox.Camera
            zoomLevel={13}
            centerCoordinate={[
              delivery_longitude,
              delivery_lat]}
          />




          <Mapbox.MarkerView
            id="pickupLocation"
            coordinate={[delivery_longitude, delivery_lat]}
            anchor={{ x: 0.5, y: 1 }}
          >

            <View style={styles.markerContainer}>
              <Image
                source={require('../../assets/hom-loc.png')}
                style={styles.markerImage2}
              />
            </View>
          </Mapbox.MarkerView>


          <Mapbox.MarkerView
            id="pickupLocation"
            coordinate={[pick_up_long, pick_up_lat]}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.markerContainer}>
              <Image
                source={require('../../assets/pickup-loc.png')}
                style={styles.markerImage}
              />
            </View>
          </Mapbox.MarkerView>

        </Mapbox.MapView>

      </View>


      <BottomSheet
        driverPhoto={driverPhoto}
        pick={pick_up}
        orderId={orderId}
        deliver={deliver_to}
        carNumber={carNumber}
        pickupLocation={pickupLocation}
        dropLocation={dropLocation}
        name={name}
        photo={photo}
        phone={phone}
        pick_up_lat={pick_up_lat}
        pick_up_long={pick_up_long}
        delivery_lat={delivery_lat}
        delivery_longitude={delivery_longitude}
        navigation={navigation}
        distance={distance}
        pickup_status={pickup_status}
      />
      <CheckLocation />
    </GestureHandlerRootView>
  );
};

export default TrackOrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  titleBarContainer: {
    position: 'absolute',
    top: 10,
    flex: 1,
    zIndex: 11,
    width: "92%",
    // marginHorizontal: "2%"
    alignSelf: 'center'
  },
  markerContainer: {
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerImage: {
    height: 40,
    width: 40,
  },
  markerImage2: {
    height: 50,
    width: 50,
  },
});
