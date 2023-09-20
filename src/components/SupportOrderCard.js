import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../api";

export const SupportOrderCard = (props) => {
  const [authToken, setAuthToken] = useState("");

  const navigation = useNavigation();
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
  } = props;
  AsyncStorage.getItem("token").then((token) => {
    setAuthToken(token);
  });
  const itemtype = item_type;
  const itemstring = itemtype.toString();

  //   switch (status) {
  //     case 0:
  //       status = "Pending";
  //       break;
  //     case 1:
  //       status = "Accepted";
  //       break;
  //     case 2:
  //       status = "Completed";
  //       break;
  //     case 4:
  //       status = "Rejected";
  //       break;
  //     case 3:
  //       status = "Cancelled";
  //       break;
  //     default:
  //       break;
  //   }
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
  // console.log(orderId+"_"+user_id);

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Chat", {
          user_id: user_id,
          orderId: orderId,
          Billing_Details: Billing_Details,
        })
      }
    >
      <View
        paddingHorizontal={20}
        paddingVertical={15}
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
        <Text style={{ fontFamily: "Montserrat_400Regular" }}>
          Item Type:{" "}
          <Text
            style={{ lineHeight: 20, fontFamily: "Montserrat_600SemiBold" }}
          >
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
      </View>
    </TouchableOpacity>
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
    marginRight: 20,
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
    marginRight: 20,
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
    marginRight: 20,
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
    marginRight: 20,
    fontSize: 12,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  buttonView: {
    alignItems: "center",
  },
  button: {
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#0C8A7B1A",
    width: "100%",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 0.25,
    textAlign: "center",
    color: "#0C8A7B",
    fontFamily: "Montserrat_600SemiBold",
  },
  cancelbutton: {
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#FF151514",
    width: "100%",
  },
  canceltext: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 0.25,
    textAlign: "center",
    color: "#FF1515",
    fontFamily: "Montserrat_600SemiBold",
  },
  feedbackButton: {
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
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
