import {
  Dimensions,
  StyleSheet,
  View,
  Modal,
  TextInput,
  Alert,
  TouchableOpacity,
  Linking,
  Image,
  Text,
} from "react-native";
import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import { Avatar } from "react-native-elements";
import call from "react-native-phone-call";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserLocation from "./UserLocation";
import { Snackbar } from "react-native-paper";
import { api } from "../../api";
import { Button } from "./Button";
import OrderCompleteLottie from "./OrderCompleteLottie";
import { ErrorText } from "../styles/styles";
import * as Location from "expo-location";
import messaging from "@react-native-firebase/messaging";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 200;

const BottomSheet = React.forwardRef(
  (
    {
      orderId,
      pick,
      deliver,
      photo,
      name,
      phone,
      pick_up_lat,
      pick_up_long,
      delivery_lat,
      delivery_longitude,
      navigation,
      distance,
      pickup_status,
      children,
    },
    ref
  ) => {
    const translateY = useSharedValue(0);
    const active = useSharedValue(false);

    const scrollRef = useRef();

    const pickupaddress = pick_up_lat + " " + pick_up_long;
    const deliveraddress = delivery_lat + " " + delivery_longitude;
    const [authToken, setAuthToken] = useState("");
    const [locationOff, setLocationOff] = useState(false);
    const [show, setShow] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [orderPickup, setOrderPickup] = useState(0);
    const bottomSheetRef = useRef(null); // Ref for the bottom sheet component
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [value, setValue] = useState("");
    const [showLottie, setShowLottie] = useState(false);
    const [buttonLabel, setButtonLabel] = useState("Pick Up");
    const [error, setError] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const getToken = () => {
      AsyncStorage.getItem("token").then((token) => {
        setAuthToken(token);
      });
    };

    useEffect(() => {
      getToken();
    }, [authToken]);

    useFocusEffect(
      useCallback(() => {
        setOrderPickup(pickup_status); // Reset pickup_status to initial value
      }, [])
    );

    useEffect(() => {
      getLocation();
    }, []);

    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          console.log(location);

          setCurrentLocation(location.coords);
          // console.log(currentLocation, "hi");
        }
      } catch (error) {
        console.log("Error getting current location:", error);
      }
    };

    const openMap = async (pickup, drop) => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        loc = "";
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          // console.log(location);
          loc = location.coords;

          setCurrentLocation(location.coords);
          // console.log(currentLocation, "hi");
        }
      } catch (error) {
        console.log("Error getting current location:", error);
      }

      const origin = encodeURIComponent(pickup);
      const destination = encodeURIComponent(drop);
      // const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
      // Linking.openURL(url);
      let url = "";
      if (orderPickup === 1) {
        const currentLocationString = `${loc.latitude},${loc.longitude}`;

        url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocationString}&destination=${destination}`;
      } else if (currentLocation || orderPickup === 0) {
        const currentLocationStr = `${currentLocation.latitude},${currentLocation.longitude}`;
        url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocationStr}&destination=${origin}`;
      } else {
        console.log("Current location is not available yet.");
        return;
      }

      Linking.openURL(url);
    };

    // const openMap = (pickup, drop) => {

    //   const origin = encodeURIComponent(pickup);
    //   const destination = encodeURIComponent(drop);
    //   const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    //   Linking.openURL(url);
    // };

    const args = {
      number: phone, // String value with the number to call
      prompt: false, // Optional boolean property. Determines if the user should be prompted prior to the call
      skipCanOpen: true, // Skip the canOpenURL check
    };

    const onCallHandler = () => {
      call(args).catch(console.log);
    };

    //Pickup Api
    const handlePickup = async () => {
      setLoading(true);
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ Order_Id: orderId }),
      };
      try {
        const response = await fetch(
          `${api}/driver/action/pickup`,
          requestOptions
        );
        if (response.ok) {
          const data = await response.json();
          console.log(response.ok);
          // console.log("Pickup Api ", data)
          setOrderPickup(1);
        }
      } catch (error) {
        setOrderPickup(0);
        console.log(error);
      }
    };

    //Verify
    const VerifyPin = async () => {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ Order_Id: orderId, pin: value }),
      };
      try {
        const response = await fetch(
          `${api}/driver/action/verify`,
          requestOptions
        );
        if (response.ok) {
          const data = await response.json();
          console.log(response.ok);
          if (data.msg === "Invalid Pin") {
            setError("Invalid Pin");
          } else {
            handleOrderComplete();
            setModalVisible(false);
          }
        } else {
          console.log(response.ok);
        }
      } catch (error) {
        console.log("Verify ka error", error);
      }
    };

    useEffect(() => {
      checkstatus();
    }, [authToken, orderPickup]);

    const checkstatus = async () => {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      };
      try {
        const response = await fetch(
          `${api}/orders/pickup/${orderId}`,
          requestOptions
        );
        // console.log(response.ok);
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setOrderPickup(data.data.pickup_status);
          }
        } else {
          console.log(response.ok);
        }
      } catch (error) {
        console.log("Verify ka error", error);
      }
    };

    const handleOrderComplete = async () => {
      setLoading(true);
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ Order_Id: orderId }),
      };
      try {
        const response = await fetch(
          `${api}/driver/action/complete`,
          requestOptions
        );
        if (response.ok) {
          const data = await response.json();
          if (data.msg) {
            setShow(true);
            setMessage("Order Completed Successfully");
            setLocationOff(true);
            setShowLottie(true);
            setTimeout(() => {
              setShowLottie(false);
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "DriverHome" }],
                })
              );
            }, 3000);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    handleCancelOrderNotification = () => {
      setLocationOff(true);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "DriverHome" }],
        })
      );
    };

    useEffect(() => {
      const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        title = JSON.stringify(remoteMessage);
        const jsonObj = JSON.parse(title);
        if (jsonObj.notification.title == "Order Cancelled") {
          console.log(jsonObj.notification.title);
          handleCancelOrderNotification();
        }
      });
      return unsubscribe;
    }, [authToken]);

    const scrollTo = useCallback((destination) => {
      "worklet";
      active.value = destination !== 0;
      translateY.value = withSpring(destination, { damping: 50 });
    }, []);

    const isActive = useCallback(() => {
      return active.value;
    }, []);

    useImperativeHandle(ref, () => ({ scrollTo, isActive }), [
      scrollTo,
      isActive,
    ]);

    const handleGesture = useAnimatedGestureHandler({
      onStart: (_, ctx) => {
        ctx.y = translateY.value;
      },
      onActive: (event, ctx) => {
        translateY.value = event.translationY + ctx.y;
        translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
      },
      onEnd: (event) => {
        const { translationY } = event;
        if (translationY > -SCREEN_HEIGHT / 3) {
          scrollTo(0);
        } else if (translationY < -SCREEN_HEIGHT / 1.5) {
          scrollTo(MAX_TRANSLATE_Y);
        }
      },
    });

    const rBottomSheetStyle = useAnimatedStyle(() => {
      const borderRadius = interpolate(
        translateY.value,
        [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y],
        [25, 5],
        Extrapolate.CLAMP
      );

      return {
        borderRadius,
        transform: [{ translateY: translateY.value }],
      };
    });

    return (
      <PanGestureHandler
        onGestureEvent={handleGesture}
        onHandlerStateChange={handleGesture}
      >
        <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
          <View style={styles.line} />
          {children}
          <>
            {showLottie ? (
              <OrderCompleteLottie />
            ) : (
              <View
                ref={bottomSheetRef}
                style={styles.bottomSheet}
                animation="slideInUp"
                useNativeDriver={true}
                // renderToHardwareTextureAndroid={true}
                //  pointerEvents={isBottomSheetOpen ? 'auto' : 'none'}
              >
                {locationOff && <UserLocation locationoff={locationOff} />}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    elevation: 4,
                    padding: 15,
                    backgroundColor: "white",
                    marginBottom: 10,
                    borderRadius: 12,
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    {photo !== null ? (
                      <Avatar
                        size="medium"
                        rounded
                        source={{ uri: api + "/" + photo }}
                      />
                    ) : (
                      <Avatar
                        size="medium"
                        rounded
                        source={{
                          uri: "https://img.freepik.com/premium-vector/avatar-profile-colorful-illustration-2_549209-82.jpg",
                        }}
                      />
                    )}
                    <View marginLeft={10} justifyContent="center">
                      <Text style={{ fontSize: 20 }}>
                        {name && name.length > 12
                          ? name.slice(0, 12) + "..."
                          : name}{" "}
                      </Text>
                      <Text style={{ fontSize: 11 }}>#{orderId}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={onCallHandler}>
                    <Avatar
                      size={40}
                      rounded
                      // source={{uri:photo}}
                      source={require("../../assets/call.png")}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 10,
                    backgroundColor: "white",
                    marginLeft: -10,
                    marginBottom: -5,
                  }}
                >
                  <Avatar
                    size={40}
                    rounded
                    source={require("../../assets/clock.png")}
                  />

                  <View style={{ padding: 10 }}>
                    <Text style={{ fontSize: 16, color: "#101817" }}>
                      Pickup address
                    </Text>
                    <Text style={{ color: "#828A89", fontSize: 11 }}>
                      {pick}
                    </Text>
                  </View>
                </View>
                <View marginLeft={20} flexDirection="row">
                  <Image source={require("../../assets/line.png")} />
                  <Text style={{ alignSelf: "center", marginLeft: 10 }}>
                    {distance} Km
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 10,
                    backgroundColor: "white",
                    marginLeft: -10,
                    marginBottom: -5,
                  }}
                >
                  <Avatar
                    size={40}
                    rounded
                    source={require("../../assets/location-icon.png")}
                  />
                  <View style={{ padding: 10 }}>
                    <Text style={{ fontSize: 16, color: "#101817" }}>
                      Drop off Address
                    </Text>
                    <Text style={{ color: "#828A89", fontSize: 11 }}>
                      {deliver}
                    </Text>
                  </View>
                </View>
                <View paddingVertical={20}>
                  {/* Todo maps */}

                  <Button
                    title="Track Route"
                    onPress={() => openMap(pickupaddress, deliveraddress)}
                  />
                  <View marginVertical={4}></View>
                  {orderPickup === 1 ? (
                    <Button
                      title="Complete Order"
                      disabled={true}
                      onPress={() => setModalVisible(true)}
                    />
                  ) : (
                    <Button
                      title="Pick Order"
                      bg="#0C8A7B"
                      // onPress={handlePickup}
                      // onPress={handleOrderComplete}
                      onPress={handlePickup}
                    />
                  )}
                  <View style={styles.centeredView}>
                    <Modal
                      animationType="slide"
                      transparent={true}
                      visible={modalVisible}
                      onRequestClose={() => {
                        setModalVisible(!modalVisible);
                      }}
                    >
                      <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                          <View style={{}}>
                            <Text
                              style={{
                                textAlign: "center",
                                fontFamily: "Montserrat_400Regular",
                              }}
                            >
                              Please Enter PIN
                            </Text>
                            <Text
                              style={{
                                textAlign: "center",
                                fontFamily: "Montserrat_400Regular",
                              }}
                            >
                              #{orderId}
                            </Text>

                            <TextInput
                              style={{
                                borderWidth: 1,
                                padding: 10,
                                margin: 10,
                                backgroundColor: "white",
                              }}
                              placeholder="Enter Pin"
                              keyboardType={"numeric"}
                              maxLength={4}
                              value={value}
                              onChangeText={(t) => {
                                setError(null);
                                setValue(t);
                              }}
                            />
                          </View>
                          {error !== "" && <ErrorText>{error}</ErrorText>}
                          <View
                            style={{
                              flexDirection: "row",
                              paddingTop: 15,
                              alignSelf: "flex-end",
                            }}
                          >
                            <TouchableOpacity
                              style={{
                                borderRadius: 5,
                                padding: 10,
                                alignSelf: "flex-end",
                                elevation: 2,
                                backgroundColor: "#E43D40",
                                marginRight: 10,
                              }}
                              onPress={() => {
                                setError(null);
                                setValue(null);
                                setModalVisible(!modalVisible);
                              }}
                            >
                              <Text style={styles.textStyle}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{
                                borderRadius: 5,
                                padding: 10,
                                alignSelf: "flex-end",
                                elevation: 2,
                                backgroundColor: "#0C8A7B",
                                marginRight: 11,
                              }}
                              onPress={() => {
                                if (!value) {
                                  setError("Pin cannot be empty!");
                                } else {
                                  VerifyPin();
                                }
                              }}
                            >
                              <Text style={styles.textStyle}>Ok</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </Modal>
                  </View>

                  <Snackbar visible={show} onDismiss={() => setShow(false)}>
                    {message}
                  </Snackbar>
                </View>
              </View>
            )}
          </>
        </Animated.View>
      </PanGestureHandler>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: "100%",
    backgroundColor: "white",
    position: "absolute",
    top: SCREEN_HEIGHT / 1.05,
    borderRadius: 25,
  },
  line: {
    width: 75,
    height: 4,
    backgroundColor: "grey",
    alignSelf: "center",
    marginVertical: 15,
    borderRadius: 2,
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
  },
  driverInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  driverInfoText: {
    fontSize: 16,
  },
  locationInfoContainer: {
    marginBottom: 20,
  },
  locationInfoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  centeredView: {
    flex: 1,
    // position:"absolute",
    // bottom:"50%",
    justifyContent: "center",
    // alignItems: 'center',
    // marginTop: 10,
    marginLeft: "5%",
    marginRight: "5%",
  },
  modalView: {
    margin: "5%",
    backgroundColor: "#F4F8FB",
    //borderRadius: 20,
    padding: "5%",
    // alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 5,
    padding: "3%",
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#E43D40",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 15,
    paddingLeft: "5%",
    paddingRight: "5%",
  },
  modalText: {
    marginBottom: "10%",
    textAlign: "center",
  },
});

export default BottomSheet;
