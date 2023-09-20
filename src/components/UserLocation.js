import * as React from "react";
import { StyleSheet,StatusBar,Platform,SafeAreaView,TouchableOpacity,Text,View, } from "react-native";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { Alert } from "react-native";
import {  getFirestore,collection,doc,setDoc,serverTimestamp,query,where,getDocs,getDoc,orderBy,limit, updateDoc,} from "firebase/firestore";
import { db } from '../../firebase';



const UserLocation = (props)=> {
  const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 20 : StatusBar.currentHeight;
  const LOCATION_TRACKING = "location-tracking";
    const { orderId ,userId, locationoff} = props;
    console.log(locationoff);
    const [state,setState]=React.useState('')
    // const locationId = `${orderId}_${userId}`
    // console.log("dsfsdfdsf", locationId)
  const [locationStarted, setLocationStarted] = React.useState(false);

  
  React.useEffect(()=>{
    startLocation()
  },[orderId ,userId])
  const startLocation = () => {
    setLocationStarted(true);
    startLocationTracking();
  };
  // React.useEffect(()=>{
  //   startLocation()
  // },[])
  

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
  if (error) {
    console.log("LOCATION_TRACKING task ERROR:", error);
    return;
  }
  if (data) {
    const { locations } = data;
    let lat = locations[0].coords.latitude;
    let long = locations[0].coords.longitude;
    // console.log("fgjjjfgjjjgjjg:",lat,long);

    console.log(`${new Date(Date.now()).toLocaleString()}: ${lat},${long}`);
     
    const locationDocRef = doc(db, "LocationData", `${orderId}`);
    const locationDocSnapshot = await getDoc(locationDocRef);

    if (locationDocSnapshot.exists()) {
      // If the document exists, compare its latitude and longitude with the latest entered values
      const locationData = locationDocSnapshot.data();
      if (locationData.latitude === lat && locationData.longitude === long) {
        console.log("Location already exists in Firestore");
      } else {
        // If the latest entered values are different from the existing location, update the document
        try {
          await updateDoc(locationDocRef, {
            latitude: lat,
            longitude: long,
            timestamp: serverTimestamp(),
          });
          console.log("Location data updated in Firestore");
          // console.log(locationId);
        } catch (e) {
          console.log("Error updating location data in Firestore: ", e);
        }
      }
    } else {
      // If the document does not exist, add the new location
      try {
        await setDoc(locationDocRef, {
          latitude: lat,
          longitude: long,
          timestamp: serverTimestamp(),
        });
        console.log("Location data added to Firestore");
      } catch (e) {
        console.log("Error adding location data to Firestore: ", e);
      }
    }
  }
//   fetchLatestLocation();
});
  
  const startLocationTracking = async () => {
    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Location.Accuracy.BestForNavigation,
      // timeInterval:5000,
      showsBackgroundLocationIndicator: true,
      distanceInterval: 10, 
      foregroundService: {
        notificationTitle: "BackgroundLocation Is On",
        notificationBody: "We are tracking your location",
        notificationColor: "#ffce52",
      },
    });
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TRACKING
    );
    setLocationStarted(hasStarted);
    console.log("tracking started?", hasStarted);
  };

  const stopLocation = () => {
    setLocationStarted(false);
    TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING).then((tracking) => {
      if (tracking) {
        Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
      }
    });
  };

  React.useEffect(()=>{
    if(locationoff){

      stopLocation()
    }

  },[locationoff])
 
  


  return (
    <View>
      
    </View>
  );
};

export default UserLocation;