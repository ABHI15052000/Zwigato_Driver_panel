import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import messaging from "@react-native-firebase/messaging";
import Toast from "react-native-toast-message";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigation } from "@react-navigation/native";
import notifee, { EventType, AndroidImportance } from "@notifee/react-native";
import { AndroidStyle } from "@notifee/react-native";
export const FcmToken = ({ inputSelect, fetch }) => {
  const [idtoken, setIdtoken] = useState("");
  const navigation = useNavigation();

  async function requestUserPermission() {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }
  }

  async function onDisplayNotification(data) {
    const channelId = await notifee.createChannel({
      id: "important",
      name: "Important Notifications",
      importance: AndroidImportance.HIGH,
    });
    // console.log(channelId)
    await notifee.displayNotification({
      title: data.notification.title,
      body: data.notification.body,
      android: {
        channelId,
        color: "#0C8A7B",
        //smallIcon: "ic_small_icon_n",
        largeIcon: require("../../assets/logo.png"),
        //smallIcon: "",
      },
    });
  }
  useEffect(() => {
    if (requestUserPermission()) {
      messaging()
        .getToken()
        .then((token) => {
          // console.log(token)

          inputSelect(token);
          setIdtoken(token);
        });
    } else {
      console.log("Permission denied status", authStatus);
    }
    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(async (remoteMessage) => {
        if (remoteMessage) {
          // console.log(
          //     'Notification caused app to open from quit state:',
          //     remoteMessage.notification,
          // );
          //setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
        }
      });

    // Assume a message-notification contains a "type" property in the data payload of the screen to open
    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      // console.log(
      //     'Notification caused app to open from background state:',
      //     remoteMessage.notification,
      // );

      if (remoteMessage.notification.title == "New Order") {
        fetch();
        navigation.navigate("DriverHome");
      } else navigation.navigate(remoteMessage.data.type);
    });

    // Register background handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      // console.log('Message handled in the background!', remoteMessage);
      fetch();
    });

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      title = JSON.stringify(remoteMessage);
      const jsonObj = JSON.parse(title);
      // if(jsonObj.notification.title=="New Order Arrived"){
      //     console.log(jsonObj.notification.title, "ander qala");
      //     fetch();
      // }

      //    console.log("-----------------",jsonObj);
      // Toast.show({
      //     type: "success",
      //     text1: jsonObj.notification.title,
      //     text2: jsonObj.notification.body
      //   });
      onDisplayNotification(remoteMessage);
    });
    return unsubscribe;
  }, []);

  return <View></View>;
};
