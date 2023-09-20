import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Avatar } from 'react-native-elements';
import call from 'react-native-phone-call';
import { Button } from '../components/Button';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation, CommonActions } from "@react-navigation/native";
import { useCallback } from "react";
import { api } from '../../api';
import UserLocation from '../components/UserLocation';
import { Snackbar } from 'react-native-paper';
import { Modal } from 'react-native';
import { Pressable } from 'react-native';
import { TextInput } from 'react-native';
import { Alert } from 'react-native';
// import OrderCompleteLottie from '../components/OrderCompleteLottie';
import OrderCompleteLottie from './../components/OrderCompleteLottie';

const BottomSheetContents = ({ orderId, pick, deliver, photo, name, phone, pick_up_lat, pick_up_long, delivery_lat, delivery_longitude, navigation, distance, pickup_status }) => {
  console.log("pickjfg gdgsdjsfdkjjjkjdsjjfd", pickup_status);
  // console.log(pick_up_lat, pick_up_long, delivery_lat, delivery_longitude);

  const pickupaddress = pick_up_lat + " " + pick_up_long;
  const deliveraddress = delivery_lat + " " + delivery_longitude;
  const [authToken, setAuthToken] = useState('');
  const [locationOff, setLocationOff] = useState(false)
  const [show, setShow] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false);
  const [pickup, setPickup] = useState(false)
  const bottomSheetRef = useRef(null); // Ref for the bottom sheet component
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [value, setValue] = useState('')
  const [showLottie, setShowLottie] = useState(false)
  const [buttonLabel, setButtonLabel] = useState('Pick Up');

  // const navigation = useNavigation();


  const getToken = () => {
    AsyncStorage.getItem('token').then((token) => {
      setAuthToken(token)
    });
  }

  useEffect(() => {
    getToken();
  }, [authToken])

  useFocusEffect(
    useCallback(() => {
      setPickup(pickup_status); // Reset pickup_status to initial value

    }, [])
  );

  const openMap = (pickup, drop) => {

    const origin = encodeURIComponent(pickup);
    const destination = encodeURIComponent(drop);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    Linking.openURL(url);
  };

  const args = {
    number: phone, // String value with the number to call
    prompt: false, // Optional boolean property. Determines if the user should be prompted prior to the call 
    skipCanOpen: true // Skip the canOpenURL check
  }

  const onCallHandler = () => {
    call(args).catch(console.log)
  }



  //Pickup Api
  const handlePickup = async () => {
    setLoading(true)
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
        console.log("Pickup Api ", data)
        setPickup(true)

      }
    } catch (error) {
      setPickup(false)
      console.log(error);
    }
  }


  //Verify 
  const VerifyPin = async () => {
    console.log("Verify k andar aa gya")
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
        console.log(response.ok)
        console.log("Verify Pin ka data", data)
        console.log("dsfhjjkfdsjkjbksdjfsdfds", data.success);
        if (data.msg === "Invalid Pin") {
          Alert.alert("Invalid Pin mat daalo")
        }
        else {

          handleOrderComplete();
        }
        setModalVisible(false)
        // console.log(data);

      }
      else {
        console.log(response.ok);
      }
    } catch (error) {
      console.log("Verify ka error", error);
    }
  }

  useEffect(() => {
    checkstatus();
  }, [pickup])

  const checkstatus = async () => {
    console.log(orderId);
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
      console.log(response.ok);
      if (response.ok) {
        const data = await response.json();
        console.log("dfsf", data)
        if (data.data) {
          setPickup(data.data.pickup_status)
        }


      }
      else {
        console.log(response.ok);
      }
    } catch (error) {
      console.log("Verify ka error", error);
    }
  }


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
        // try {
        //   await AsyncStorage.removeItem('driverState');
        //   console.log('Driver state removed');
        // } catch (error) {
        //   console.log('Error while removing driver state:', error);
        // }

        // console.log(data);

        // console.log(data);
        if (data.msg) {
          setShow(true);
          setMessage("Order Completed Successfully")
          console.log(data.msg);
          setLocationOff(true)
          setShowLottie(true);
          setTimeout(() => {
            setShowLottie(false)
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'DriverHome' }],
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
  }


  console.log("location batayega ye", locationOff)
  return (
    <>
      {showLottie ? <OrderCompleteLottie /> :
        <Animatable.View
          ref={bottomSheetRef}
          style={styles.bottomSheet}
          animation="slideInUp"
          useNativeDriver={true}
          // renderToHardwareTextureAndroid={true}
        //  pointerEvents={isBottomSheetOpen ? 'auto' : 'none'}
        >

          {locationOff &&
            <UserLocation locationoff={locationOff} />
          }
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

            }}>
            <View style={{ flexDirection: 'row' }}>
              {photo !== null ?
                <Avatar
                  size="medium"
                  rounded
                  source={{ uri: api + '/' + photo }}
                />
                :
                <Avatar
                  size="medium"
                  rounded
                  source={{
                    uri: "https://img.freepik.com/premium-vector/avatar-profile-colorful-illustration-2_549209-82.jpg"
                  }}
                />
              }
              <View marginLeft={10} justifyContent="center">
                <Text style={{ fontSize: 20 }}>{name.split(" ")[0]} </Text>
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
              marginBottom: -5
            }}>
            <Avatar
              size={40}
              rounded
              source={require("../../assets/clock.png")}
            />

            <View style={{ padding: 10 }}>
              <Text style={{ fontSize: 16, color: "#101817" }}>
                Pickup address
              </Text>
              <Text style={{ color: "#828A89", fontSize: 11 }}>{pick}</Text>
            </View>
          </View>
          <View marginLeft={20} flexDirection="row">
            <Image
              source={require("../../assets/line.png")}
            />
            <Text style={{ alignSelf: 'center', marginLeft: 10 }}>{distance} Km</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
              backgroundColor: "white",
              marginLeft: -10,
              marginBottom: -5
            }}>
            <Avatar
              size={40}
              rounded
              source={require("../../assets/location-icon.png")}
            />
            <View style={{ padding: 10 }}>
              <Text style={{ fontSize: 16, color: "#101817" }}>
                Drop off Address
              </Text>
              <Text style={{ color: "#828A89", fontSize: 11 }}>{deliver}</Text>
            </View>
          </View>
          <View paddingVertical={20}>

            {/* Todo maps */}

            <Button title="Track Route" onPress={() => openMap(pickupaddress, deliveraddress)} />
            <View marginVertical={4}></View>
            {pickup === 1 ? (
              <Button title="Complete Order" disabled={true} onPress={() => setModalVisible(true)} />
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
                  Alert.alert('Modal has been closed.');
                  setModalVisible(!modalVisible);
                }}>
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <View style={{}}>
                      <Text style={{ textAlign: "center", fontFamily: "Montserrat_400Regular" }}>Please Enter PIN</Text>
                      <TextInput style={{ borderWidth: 1, padding: 10, margin: 10, backgroundColor: 'white' }}
                        placeholder='Add Item' keyboardType={'numeric'} maxLength={4} value={value} onChangeText={(t) => { setValue(t) }} />
                    </View>
                    <View style={{ flexDirection: 'row', paddingTop: 15, alignSelf: 'flex-end', }}>
                      <TouchableOpacity
                        style={{
                          borderRadius: 5,
                          padding: 10, alignSelf: 'flex-end',
                          elevation: 2, backgroundColor: '#E43D40', marginRight: 10
                        }}
                        onPress={() => setModalVisible(!modalVisible)}>
                        <Text style={styles.textStyle}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          borderRadius: 5,
                          padding: 10, alignSelf: 'flex-end',
                          elevation: 2, backgroundColor: '#0C8A7B',
                          marginRight: 11
                        }}
                        onPress={() => {
                          if (!value)
                            alert("enter some value")
                          else { VerifyPin() }
                        }}>
                        <Text style={styles.textStyle}>Ok</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>

            <Snackbar
              visible={show}
              onDismiss={() => setShow(false)}
            >
              {message}
            </Snackbar>
          </View>
        </Animatable.View>

      }
    </>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {

    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,

  },
  driverInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    justifyContent: 'center',
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
    shadowColor: '#000',
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
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#E43D40',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
    paddingLeft: "5%",
    paddingRight: "5%"
  },
  modalText: {
    marginBottom: "10%",
    textAlign: 'center',
  },

});

export default BottomSheetContents;
