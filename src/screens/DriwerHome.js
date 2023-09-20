import React, { useState, useEffect, useCallback, useRef } from "react";

// import all the components we are going to use
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  AppState,
  Platform,
  Modal,
} from "react-native";
import styled from "styled-components/native";
import CustomSidebar from "../components/ModalComponent";
import { Avatar } from "react-native-elements";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ToggleSwitch from "toggle-switch-react-native";
import { GreenButton, RedButton } from "../components/Button";
import { StatusBar } from "expo-status-bar";
import { api } from "../../api";
import { Snackbar } from "react-native-paper";
import { FcmToken } from "../components/FcmToken";
import UserLocation from "../components/UserLocation";
import CheckLocation from "../components/CheckLocation";
// import { AppState } from 'react-native';
import messaging from "@react-native-firebase/messaging";

const SBView = styled.View`
  flex-direction: row;
  // text-align:center;
  // align-content:center;
  // jusitfy-content:center;
  margin: 5px;
  padding: 10px;
  border: 1px;
  margin-top: 30px;
  background-color: white;
  border-radius: 10px;
  border-color: white;
  elevation: 3;
`;
const AvatarView = styled.View`
  margin-left: 26%;
  margin-right: 10px;
`;
const MainVView = styled.View`
  margin-top: 30px;
`;
const FltList = styled.FlatList`
  padding: 10px;
  // background-color:white;
  height: 100%;
  margin-bottom: 1px;
`;
const LocView = styled.View`
  flex-direction: row;
  margin-bottom: 10px;
`;
const CText = styled.Text`
  font-weight: bold;
  margin-top: 5px;
  font-size: 14px;
  margin-bottom: 5px;
  color: #394f6b;
`;
const LocText = styled.Text`
  font-size: 12px;
  color: #8e8ea1;
  margin-right: 45px;
`;
const LoaderContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: #fff;
`;
const DriverHome = () => {
  const navigation = useNavigation();

  const [photo, setPhoto] = useState(null);
  const [isOn, setIsOn] = useState(false);
  const [isAccept, setIsAccept] = useState(false);
  const [name, setName] = useState("");
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [authToken, setAuthToken] = useState("");
  const [apiError, setApiError] = useState(null);
  const [show, setShow] = useState(false);
  const [fcmToken, SetfcmToken] = useState("");
  const [id, setId] = useState("");
  const [driverID, setDriverID] = useState("");
  const [driverState, setDriverState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // const focusEvent = Platform.OS === "android" ? 'focus':'change';
  const onRefresh = () => {
    // Set refreshing state to true
    setRefreshing(true);

    OrderFunction();
    // After completing the refreshing logic, set refreshing state to false
    setRefreshing(false);
  };

  useEffect(() => {
    AsyncStorage.getItem("toggleSwitchState")
      .then((state) => {
        setIsOn(state === "true");
      })
      .catch((error) => {
        // console.log('Error retrieving toggle switch state:', error);
      });
  }, []);

  // Save toggle switch state to AsyncStorage when it changes
  useEffect(() => {
    AsyncStorage.setItem("toggleSwitchState", String(isOn)).catch((error) => {
      // console.log('Error saving toggle switch state:', error);
    });
  }, [isOn]);
  useEffect(() => {
    const fetchAuthToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        setAuthToken(token);
      } catch (error) {
        console.log("Error retrieving token:", error);
      }
    };

    fetchAuthToken();
  }, []);
  // useEffect(() => {
  //   // Call the OrderFunction only when authToken changes
  //   if (authToken) {
  //     OrderFunction();
  //   }
  // }, [authToken]);
  const getProfilePicture = async () => {
    const photoUri = await AsyncStorage.getItem(`-photo`);
    const nameGet = await AsyncStorage.getItem("name");
    setName(nameGet);
    setPhoto(photoUri);
  };
  useFocusEffect(
    useCallback(() => {
      getProfilePicture();
    }, [])
  );

  useEffect(() => {
    OrderFunction();
  }, [isOn]);
  const handleFcm = (token) => {
    SetfcmToken(token);
    // console.log(token)
  };

  const sendFcm = useCallback(async () => {
    let token = "";
    try {
      token = await AsyncStorage.getItem("token");
      // setAuthToken(token);
    } catch (error) {
      console.log("Error retrieving token:", error);
    }
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fcmtoken: fcmToken }),
    };

    try {
      const response = await fetch(`${api}/fcmtoken`, requestOptions);
      console.log("fcm testing ", response.ok);
      const json = await response.json();
      // console.log(json);
    } catch (error) {
      // console.log("Error: json or json.data is undefined or null.");
    }
  }, [fcmToken]);
  useEffect(() => {
    if (authToken) {
      sendFcm();
    }
  }, [authToken, fcmToken]);

  const handleUpdate = async () => {
    // console.log("toggle k authtoken", authToken);
    setIsOn(!isOn);
    if (!isOn) {
      requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: "1" }),
      };
    } else {
      requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: "0" }),
      };
    }

    try {
      await fetch(`${api}/toggle`, requestOptions).then((response) => {
        response.json().then((data) => {
          console.log("ghghggghgh", data);
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  const SendAcceptUpdate = async (
    s,
    o,
    name,
    photo,
    phone,
    p,
    d,
    plat,
    plong,
    dlat,
    dlong,
    distance,
    pickup_status
  ) => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ status: s, order_id: o }),
    };
    try {
      await fetch(`${api}/driver/action/accept`, requestOptions).then(
        (response) => {
          response.json().then(async (data) => {
            if (data.msg === "Order Confirmed Successfully") {
              setDriverState(true);
              setShow(true);
              setApiError("Order Accepted Successfully!!");
              OrderFunction();
              navigation.navigate("TrackOrder", {
                orderId: o,
                pick_up: p,
                deliver_to: d,
                name: name,
                phone: phone,
                photo: photo,
                pick_up_lat: plat,
                pick_up_long: plong,
                delivery_lat: dlat,
                delivery_longitude: dlong,
                distance,
                pickup_status,
              });
              setIsLoading(false);
            } else {
              setShow(true);
              setApiError(data.msg);
              OrderFunction();
            }
          });
        }
      );
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };
  const SendRejectUpdate = async (s, o) => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ status: s, order_id: o }),
    };
    try {
      await fetch(`${api}/driver/action/reject`, requestOptions).then(
        (response) => {
          response.json().then((data) => {
            setShow(true);
            setApiError("Order Rejected!!");
            OrderFunction();
          });
        }
      );
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      title = JSON.stringify(remoteMessage);
      const jsonObj = JSON.parse(title);
      if (jsonObj.notification.title == "New Order") {
        console.log(jsonObj.notification.title, "ander qala");
        OrderFunction();
      }
    });
    return unsubscribe;
  }, [authToken]);

  const OrderFunction = async () => {
    let token = "";
    try {
      token = await AsyncStorage.getItem("token");
      // setAuthToken(token);
    } catch (error) {
      console.log("Error retrieving token:", error);
    }

    // console.log(token !== null, token !==undefined, token.length !== 0 , isOn === true);
    // console.log("order function: ",token);
    if (token !== null && token !== undefined && token.length !== 0) {
      setIsLoading(true);

      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        let response = await fetch(`${api}/driver/getCount`, requestOptions);

        // console.log("order fetch", response.ok);
        if (response.ok) {
          let json = await response.json();

          setItems(json.data);
          setOrders(json);
          // console.log("driver home api",json)
        }
      } catch (error) {
        console.log("fsdfsdfs", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };
  const fetchData = useCallback(async () => {
    // console.log("call out my name");
    let token = "";
    try {
      token = await AsyncStorage.getItem("token");
      // setAuthToken(token);
    } catch (error) {
      console.log("Error retrieving token:", error);
    }
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await fetch(`${api}/getuser`, requestOptions);
      // console.log(response.ok);
      const json = await response.json();
      // console.log("get api", json.accessToken);

      if (json.data.name) {
        setName(json.data.name);
        setPhoto(api + "/" + json.data.photo_uri);
        AsyncStorage.setItem("name", json.data.name);
        AsyncStorage.setItem("-photo", api + "/" + json.data.photo_uri);
        AsyncStorage.setItem("mapboxToken",json.accessToken);
      } else {
        AsyncStorage.removeItem("name");
      }
      // console.log(json.data)
    } catch (error) {
      console.log("Error: json or json.data is undefined or null.");
    }
  }, [name, photo]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [handleAcceptPress, handleRejectPress])
  );

  const handleAcceptPress = async (
    id,
    name,
    photo,
    phone,
    pickup_from,
    deliver_to,
    plat,
    plong,
    dlat,
    dlong,
    driverId,
    distance,
    pickup_status
  ) => {
    // console.log('Clicked item id:', id);
    setIsLoading(true);
    const locationId = `${id}_${driverId}`;
    await AsyncStorage.setItem(`${locationId}`, "start");
    SendAcceptUpdate(
      "1",
      id,
      name,
      photo,
      phone,
      pickup_from,
      deliver_to,
      plat,
      plong,
      dlat,
      dlong,
      distance,
      pickup_status
    );
    // console.log("accepted by gg")
    setId(id);
    setDriverID(driverId);
  };

  const handleRejectPress = (id) => {
    setIsLoading(true);
    // console.log('Clicked item id:', id);
    SendRejectUpdate("3", id);
  };

  const renderItem = ({ item }) => {
    const itemtype = item.category_item_type;
    const itemstring = itemtype.toString();

    return (
      <View padding={10} backgroundColor="white" marginBottom={10}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <CText>Order #{item.order_id}</CText>
          <View
            style={{
              flexDirection: "row",
              marginRight: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ marginRight: 10, fontSize: 12 }}>
              {item.User.name !== null && item.User.name.split(" ")[0]}
            </Text>
            {item.User.photo_uri === null ? (
              <Avatar
                rounded
                size="small"
                source={{
                  uri: "https://img.freepik.com/premium-vector/avatar-profile-colorful-illustration-2_549209-82.jpg",
                }}
                activeOpacity={0.7}
              />
            ) : (
              <Avatar
                rounded
                size="small"
                source={{ uri: `${api}/${item.User.photo_uri}` }}
                activeOpacity={0.7}
              />
            )}
          </View>
        </View>
        <Text style={{ fontSize: 14, marginBottom: 6 }}>
          Item Type : <Text style={{ fontWeight: "bold" }}>{itemstring}</Text>
        </Text>
        <LocView>
          <Image
            source={require("../../assets/Loc1.png")}
            style={{ width: 15, height: 19, marginRight: 10 }}
          />
          <LocText>{item.pickup_from}</LocText>
        </LocView>
        <LocView>
          <Image
            source={require("../../assets/Loc2.png")}
            style={{ width: 15, height: 20, marginRight: 10 }}
          />
          <LocText>{item.deliver_to}</LocText>
        </LocView>
        <LocText>{item.order_created_time}</LocText>
        {/* <LocText>{item.order_completed_time}</LocText> */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <GreenButton
            onPress={() =>
              handleAcceptPress(
                item.order_id,
                item.User.name,
                item.User.photo_uri,
                item.User.phone,
                item.pickup_from,
                item.deliver_to,
                item.pickup_latitude,
                item.pickup_longitude,
                item.delivery_latitude,
                item.delivery_longitude,
                item.driver_id,
                item.distance_km,
                item.pickup_status
              )
            }
          />
          <RedButton onPress={() => handleRejectPress(item.order_id)} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FcmToken inputSelect={handleFcm} fetch={OrderFunction} />
      {id !== "" && driverID !== "" && (
        <UserLocation orderId={id} userId={driverID} />
      )}
      <View
        style={{
          height: 52,
          marginTop: 10,
          backgroundColor: "white",
          borderRadius: 8,
          width: "92%",
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "center",
          justifyContent: "center",
          marginBottom: 20,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          marginTop: 30,
        }}
      >
        <View style={{ position: "absolute", left: 20 }}>
          <TouchableOpacity>
            <CustomSidebar />
          </TouchableOpacity>
        </View>

        <View>
          {!photo && (
            <TouchableOpacity
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Avatar
                rounded
                size="small"
                source={{
                  uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
                }}
                activeOpacity={0.7}
              />
            </TouchableOpacity>
          )}
          {photo && (
            <TouchableOpacity
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Avatar
                rounded
                size="small"
                source={{ uri: photo }}
                backgroundColor="#2182BD"
              />
            </TouchableOpacity>
          )}
        </View>

        <Text
          style={{
            marginLeft: 5,
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {name && name.length > 10 ? name.slice(0, 10) + "..." : name}
        </Text>
        <View style={{ borderLeftWidth: 1, position: "absolute", right: 70 }}>
          <ToggleSwitch
            isOn={isOn}
            onColor="#0ea493"
            offColor="#E4E4E4"
            size="medium"
            onToggle={handleUpdate}
            style={{
              marginLeft: 10,
              justifyContent: "center",
              marginRight: "10%",
            }}
          />
        </View>
      </View>
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size={40} />
        </View>
      ) : (
        <>
          <MainVView></MainVView>
          {isOn ? (
            <View style={styles.container}>
              <Text style={styles.tStyle}>{orders.count}</Text>
              <Text style={styles.txtStyle}> Orders</Text>
              <Text style={styles.textStyle}> Till {orders.Till} </Text>
              {orders.count === 0 ? (
                <Text
                  style={{
                    textAlign: "center",
                    marginTop: "10%",
                    fontSize: 20,
                    fontFamily: "Montserrat_600SemiBold",
                    color: "#0C8A7B",
                  }}
                >
                  No Orders Available!
                </Text>
              ) : (
                ""
              )}
            </View>
          ) : (
            <Text
              style={{
                fontSize: 30,
                color: "#0C8A7B",
                textAlign: "center",
                justifyContent: "center",
                marginTop: "50%",
                fontWeight: "bold",
              }}
            >
              You are offline 😴
            </Text>
          )}
          {items && isOn && (
            <FltList
              data={items}
              keyExtractor={(item) => item.order_id}
              renderItem={renderItem}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}

          {/* </CardView> */}
          <Snackbar
            visible={show}
            duration={1000}
            onDismiss={() => setShow(false)}
          >
            {apiError}
          </Snackbar>
          <View marginTop="auto">
            <CheckLocation />
          </View>
        </>
      )}

      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: 'white',
    justifyContent: "center",
    // padding: 10,
    marginBottom: 30,
  },
  textStyle: {
    textAlign: "center",
    fontSize: 14,
    color: "#959595",
  },
  txtStyle: {
    textAlign: "center",
    fontSize: 18,
    color: "#0C8A7B",
  },
  tStyle: {
    textAlign: "center",
    fontSize: 80,
    color: "#0C8A7B",
  },
  verticleLine: {
    height: "100%",
    width: 1,
    backgroundColor: "#909090",
    marginLeft: "5%",
    marginRight: "20%",
  },
  centeredVieW: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalVieW: {
    margin: 20,

    borderRadius: 20,
    width: "70%",
    height: "20%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DriverHome;
