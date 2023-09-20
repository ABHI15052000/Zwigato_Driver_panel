import {
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Container, CenteredView } from "../styles/styles";
import { Header } from "../components/Header";
import { HorizontalScroll } from "../components/HorizontalScroll";
import { OrderCard } from "../components/OrderCard";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Titlebar from "../components/TitileBar";
import { View } from "react-native";
import { api } from "./../../api";
import CheckLocation from "../components/CheckLocation";
import messaging from "@react-native-firebase/messaging";

export const OrdersScreen = ({ navigation }) => {
  const [authToken, setAuthToken] = useState("");
  const [orders, setOrders] = useState([]);
  const [list, setList] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [cancel, setCancel] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // const focusEvent = Platform.OS === "android" ? 'focus':'change';
  const onRefresh = () => {
    // Set refreshing state to true
    setRefreshing(true);

    fetchData();
    // After completing the refreshing logic, set refreshing state to false
    setRefreshing(false);
  };

  // console.log(orders);

  AsyncStorage.getItem("token").then((token) => {
    setAuthToken(token);
  });
  // console.log(orders);
  const handleListChange = (value) => {
    setIsLoading(true);
    setOrders([]);
    switch (value) {
      case "Accepted":
        value = "accept";
        break;
      case "Completed":
        value = "complete";
        break;
      case "Cancelled":
        value = "cancel";
        break;
      case "Rejected":
        value = "reject";
        break;
      default:
        value = "all";
        break;
    }
    setList(value);
  };

  async function fetchData() {
    setIsLoading(true);
    // console.log(list);
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    };
    try {
      const response = await fetch(
        `${api}/driver/action/${list}`,
        requestOptions
      );
      console.log(response.ok);
      if (response.ok) {
        const data = await response.json();
        //console.log(data);
        // console.log(data.msg[0].Order.User.phone);
        // console.log(data.msg[2].Order.User);

        // console.log("sddddfd", data.data[0].Order.User.photo);
        if (data.msg) {
          // console.log(data);
          setOrders(data.data);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      title = JSON.stringify(remoteMessage);
      const jsonObj = JSON.parse(title);
      console.log("-----------------", jsonObj);
      if (
        jsonObj.notification.title === "Order Completed" ||
        jsonObj.notification.title === "Order Accepted" ||
        jsonObj.notification.title === "Order Cancelled"
      ) {
        fetchData();
      }
    });
    return unsubscribe;
  }, [list]);

  useEffect(() => {
    if (authToken) {
      fetchData();
    }
  }, [authToken, list]);

  const convertDate = (str) => {
    const date = new Date(str);

    const options = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-US", options);

    const timeOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    const formattedTime = date.toLocaleTimeString("en-US", timeOptions);
    const finalFormattedDate = `${formattedDate}, ${formattedTime}`;
    return finalFormattedDate;
  };
  const renderItem = ({ item }) => {
    // console.log(item.Order.order_status, item.Order.order_id, "dssd");
    if (list === "accept" && item.Order.order_status === "3") {
      return;
    }
    return (
      <OrderCard
        key={
          Math.floor(Math.random() * 10 + 1) +
          item.order_id +
          Math.floor(Math.random() * 10 + 1)
        }
        user_id={item.user_id}
        orderId={item.order_id || item.Order.order_id}
        item_type={item.category_item_type || item.Order.category_item_type}
        status={item.Order.order_status === "3" ? 2 : item.driver_order_status}
        Pickup_from={item.pickup_from || item.Order.pickup_from}
        Deliver_To={item.deliver_to || item.Order.deliver_to}
        Billing_Details={item.billing_details || item.Order.billing_details}
        timing={convertDate(item.createdAt)}
        name={item.Order.User.name}
        photo={item.Order.User.photo_uri}
        phone={item.Order.User.phone}
        pick_up_lat={item.Order.pickup_latitude}
        pick_up_long={item.Order.pickup_longitude}
        delivery_lat={item.Order.delivery_latitude}
        delivery_longitude={item.Order.delivery_longitude}
        fetchData={fetchData}
        navigation={navigation}
        distance={item.Order.distance_km}
        instruction={item.Order.instruction}
        pickup_status={item.Order.pickup_status}
      />
    );
  };

  return (
    <>
      <View flex={1}>
        <View marginHorizontal="5%">
          <Titlebar title="Orders" />
        </View>
        <HorizontalScroll inputSelect={handleListChange} />
        {isLoading ? (
          <CenteredView>
            <ActivityIndicator size="large" color="#0C8A7B" />
          </CenteredView>
        ) : orders.length === 0 ? (
          <CenteredView>
            <Text style={{ fontSize: 20 }}>No Order Yet</Text>
          </CenteredView>
        ) : (
          // <ScrollView showsVerticalScrollIndicator={false}  refreshControl={
          //   <RefreshControl
          //     refreshing={refreshing}
          //     onRefresh={onRefresh}
          //   />
          // }>
          //   {orders.map((order) => (
          //     <OrderCard
          //       key={Math.floor((Math.random() * 10) + 1) + order.order_id + Math.floor((Math.random() * 10) + 1)}
          //       user_id={order.user_id}
          //       orderId={order.order_id || order.Order.order_id}
          //       item_type={order.category_item_type || order.Order.category_item_type}
          //       status={order.order_status || order.driver_order_status}
          //       Pickup_from={order.pickup_from || order.Order.pickup_from}
          //       Deliver_To={order.deliver_to || order.Order.deliver_to}
          //       Billing_Details={order.billing_details || order.Order.billing_details}
          //       timing={convertDate(order.createdAt)}
          //       name={order.Order.User.name}
          //       photo={order.Order.User.photo_uri}
          //       phone={order.Order.User.phone}
          //       pick_up_lat={order.Order.pickup_latitude}
          //       pick_up_long={order.Order.pickup_longitude}
          //       delivery_lat={order.Order.delivery_latitude}
          //       delivery_longitude={order.Order.delivery_longitude}
          //       fetchData={fetchData}
          //       navigation={navigation}
          //       distance={order.Order.distance_km}
          //       instruction={order.Order.instruction}
          //       pickup_status={order.Order.pickup_status}
          //     />
          //   ))}
          // </ScrollView>
          <FlatList
            data={orders}
            renderItem={renderItem}
            keyExtractor={(item) =>
              Math.floor(Math.random() * 10 + 1) +
              item.order_id +
              Math.floor(Math.random() * 10 + 1)
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
        <StatusBar style="dark" />
      </View>
      <CheckLocation />
    </>
  );
};
