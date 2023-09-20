import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../api";
import UserLocation from "./UserLocation";
import { Avatar } from "react-native-elements";

export const OrderCard = (props) => {
  const [authToken, setAuthToken] = useState("");
  const [locationOff, setLocationOff] = useState(false);
  const [sendLocation, setSendLocation] = useState(false);
  // const navigation = useNavigation();
  let {
    orderId,
    item_type,
    Pickup_from,
    Deliver_To,
    Billing_Details,
    status,
    user_id,
    timing,
    fetchData,
    name,
    photo,
    phone,
    pick_up_lat,
    pick_up_long,
    delivery_lat,
    delivery_longitude,
    navigation,
    distance,
    instruction,
    pickup_status,
  } = props;

  // console.log("orfer card wali acreen ka pickup",pickup_status);
  const itemtype = item_type;
  const itemstring = itemtype.toString();
  AsyncStorage.getItem("token").then((token) => {
    setAuthToken(token);
  });
  // console.log(name,photo);

  switch (status) {
    case 0:
      status = "Accepted";
      break;
    case 1:
      status = "Completed";
      break;
    case 2:
      status = "Cancelled";
      break;
    case 3:
      status = "Rejected";
      break;

    default:
      break;
  }

  const cancelOrder = async (id) => {
    setLocationOff(true);
    setSendLocation(false);

    console.log("hi got clicked", id);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ order_id: id }),
    };

    try {
      const response = await fetch(
        `${api}/driver/action/cancel`,
        requestOptions
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        fetchData();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView
      paddingHorizontal={20}
      paddingVertical={25}
      marginVertical={10}
      backgroundColor="#fff"
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text
          style={{ color: "#8E8EA1", fontFamily: "Montserrat_600SemiBold" }}
        >
          Order #{orderId}
        </Text>

        <View style={styles.location}>
          {status === "Accepted" && (
            <Text style={styles.statusTextAccepted}>{status}</Text>
          )}
          {status === "Completed" && (
            <Text style={styles.statusTextCompleted}>{status}</Text>
          )}
          {status === "Cancelled" && (
            <Text style={styles.statusTextCancelled}>{status}</Text>
          )}
          {status === "Rejected" && (
            <Text style={styles.statusTextCancelled}>{status}</Text>
          )}
        </View>
      </View>
      <View style={{ flexDirection: "row" }}>
        <Avatar
          rounded
          size="small"
          source={{ uri: `${api}/${photo}` }}
          activeOpacity={0.7}
        />
        <Text style={{ textAlign: "center", padding: "2%" }}>{name}</Text>
      </View>
      <Text style={{ fontFamily: "Montserrat_400Regular" }}>
        Item Type:{" "}
        <Text style={{ lineHeight: 20, fontFamily: "Montserrat_600SemiBold" }}>
          {itemstring}
        </Text>
      </Text>

      <View style={{ marginLeft: -6, marginTop: 8, flexDirection: "row" }}>
        <Entypo name="location-pin" size={24} color="#BFBFBF" />
        <Text
          style={{
            color: "#8E8EA1",
            fontSize: 12,
            fontFamily: "Montserrat_400Regular",
            flexWrap: "wrap",
            maxWidth: "90%",
          }}
        >
          {Pickup_from}
        </Text>
      </View>
      <View style={{ marginLeft: -6, marginTop: 8, flexDirection: "row" }}>
        <Entypo name="location-pin" size={24} color="#FF9C1C" />
        <Text
          style={{
            color: "#8E8EA1",
            fontSize: 12,
            fontFamily: "Montserrat_400Regular",
            flexWrap: "wrap",
            maxWidth: "90%",
          }}
        >
          {Deliver_To}
        </Text>
      </View>

      <View
        marginVertical={12}
        marginLeft={6}
        marginRight={15}
        style={styles.location}
      >
        <Text
          style={{
            color: "#8E8EA1",
            fontFamily: "Montserrat_400Regular",
            fontSize: 12,
          }}
        >
          {timing}
        </Text>
        <Text
          style={{
            fontSize: 20,
            color: "#394F6B",
            fontFamily: "Montserrat_600SemiBold",
          }}
        >
          $ {Billing_Details}
        </Text>
      </View>
      <View>
        <Text style={{ fontWeight: "bold" }}>Instructions:</Text>
        <Text style={{ paddingTop: "2%", paddingBottom: "3%" }}>
          {instruction}
        </Text>
      </View>

      {status === "Cancelled" ||
      status === "Rejected" ||
      status === "Completed" ? (
        <View marginBottom={-10}></View>
      ) : (
        <View
          style={
            status === "Accepted" ? styles.buttonFlexView : styles.buttonView
          }
        >
          {/* <TouchableOpacity onPress={() => {
                        navigation.navigate('Orderdetail', {
                            orderId, item_type, Pickup_from, Deliver_To, Billing_Details, status, user_id, timing
                        })
                    }}>
                        <View style={styles.button} >
                            <Text style={styles.text}>View Details</Text>
                        </View>
                    </TouchableOpacity> */}
          {status === "Accepted" ? (
            <>
              <TouchableOpacity
                onPress={() => {
                  setSendLocation(true);
                  navigation.navigate("TrackOrder", {
                    orderId,
                    item_type: itemstring,
                    pick_up: Pickup_from,
                    deliver_to: Deliver_To,
                    Billing_Details,
                    status,
                    user_id,
                    timing,
                    name,
                    photo,
                    phone,
                    pick_up_lat,
                    pick_up_long,
                    delivery_lat,
                    delivery_longitude,
                    distance,
                    pickup_status,
                  });
                }}
              >
                <View style={styles.button}>
                  <Text style={styles.text}>Track Order</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => cancelOrder(orderId)}>
                <View style={styles.cancelbutton}>
                  <Text style={styles.canceltext}>Cancel</Text>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Feedback", {
                  driver_orderId: orderId,
                })
              }
            >
              <View style={styles.feedbackButton}>
                <Text style={styles.feedbackText}>Give Feedback</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}
      {locationOff && <UserLocation locationoff={locationOff} />}
      {sendLocation && <UserLocation orderId={orderId} userId={user_id} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  location: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusText: {
    fontFamily: "Montserrat_600SemiBold",
    backgroundColor: "#e3e3e8",
    color: "#8E8EA1",
    fontWeight: 600,
    borderRadius: 15,
    fontSize: 12,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  statusTextAccepted: {
    fontFamily: "Montserrat_600SemiBold",
    backgroundColor: "#FFF6E7",
    color: "#FF9C1C",
    fontWeight: 600,
    borderRadius: 15,
    fontSize: 12,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  statusTextCompleted: {
    fontFamily: "Montserrat_600SemiBold",
    backgroundColor: "#E6FAEE",
    color: "#00C853",
    fontWeight: 600,
    borderRadius: 15,
    fontSize: 12,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  statusTextCancelled: {
    fontFamily: "Montserrat_600SemiBold",
    backgroundColor: "#FF151514",
    color: "#FF4A55",
    fontWeight: 600,
    borderRadius: 15,
    fontSize: 12,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  buttonView: {
    alignItems: "center",
  },
  buttonFlexView: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: "8%",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#0C8A7B1A",
    width: "100%",
  },
  text: {
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.25,
    textAlign: "center",
    color: "#0C8A7B",
    fontFamily: "Montserrat_600SemiBold",
  },
  cancelbutton: {
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: "12%",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#FF151514",
    width: "100%",
  },
  canceltext: {
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.25,
    textAlign: "center",
    color: "#FF1515",
    fontFamily: "Montserrat_600SemiBold",
  },
  feedbackButton: {
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: "5%",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#FFEFD4",
    width: "100%",
  },
  feedbackText: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 0.25,
    textAlign: "center",
    color: "#FF9C1C",
    fontFamily: "Montserrat_400Regular",
  },
});
