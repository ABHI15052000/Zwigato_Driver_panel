import * as TaskManager from "expo-task-manager";

export const LOCATION_TRACKING = "location-tracking";

// TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
//   // Task implementation...
// });
TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
    if (error) {
      console.log("LOCATION_TRACKING task ERROR:", error);
      return;
    }
    if (data) {
      const { locations } = data;
      let lat = locations[0].coords.latitude;
      let long = locations[0].coords.longitude;
  
      console.log(`${new Date(Date.now()).toLocaleString()}: ${lat},${long}`);
       
      const locationDocRef = doc(db, "LocationData", `${locationId}`);
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
            console.log(locationId);
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
