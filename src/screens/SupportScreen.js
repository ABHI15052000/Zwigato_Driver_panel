import { Text, ScrollView, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { Container, CenteredView } from "../styles/styles";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Titlebar from "../components/TitileBar";
import { View } from "react-native";
import { api } from "./../../api";
import { SupportOrderCard } from "../components/SupportOrderCard";
import CheckLocation from "../components/CheckLocation";
import { RefreshControl } from "react-native";

export const SupportScreen = () => {
  const [authToken, setAuthToken] = useState("");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // const focusEvent = Platform.OS === "android" ? 'focus':'change';
  const onRefresh = () => {
    // Set refreshing state to true
    setRefreshing(true);

    fetchData();
    // After completing the refreshing logic, set refreshing state to false
    setRefreshing(false);
  };

  AsyncStorage.getItem("token").then((token) => {
    setAuthToken(token);
  });

  async function fetchData() {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    };
    try {
      const response = await fetch(`${api}/driver/action/all`, requestOptions);
      // console.log(response.ok);
      if (response.ok) {
        const data = await response.json();

        if (data.msg) {
          // console.log(data.orders);
          setOrders(data.data);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (authToken) {
      fetchData();
    }
  }, [authToken]);
  // console.log(orders);
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
  // console.log(orders[0].driver_id);

  return (
    <>
      <View flex={1}>
        <View marginHorizontal="5%" marginTop={5}>
          <Titlebar title="Support" />
        </View>
        {isLoading ? (
          <CenteredView>
            <ActivityIndicator size="large" color="#0C8A7B" />
          </CenteredView>
        ) : orders.length === 0 ? (
          <CenteredView>
            <Text>No Order Yet! Place an order!!!</Text>
          </CenteredView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {orders.map((order) => {
              return (
                <SupportOrderCard
                  key={
                    Math.floor(Math.random() * 10 + 1) +
                    order.order_id +
                    Math.floor(Math.random() * 10 + 1)
                  }
                  // key={order.order_id}
                  user_id={order.driver_id}
                  orderId={order.order_id || order.Order.order_id}
                  item_type={
                    order.category_item_type || order.Order.category_item_type
                  }
                  status={
                    order.Order.order_status == 3
                      ? 2
                      : order.driver_order_status
                  }
                  Pickup_from={order.pickup_from || order.Order.pickup_from}
                  Deliver_To={order.deliver_to || order.Order.deliver_to}
                  Billing_Details={
                    order.billing_details || order.Order.billing_details
                  }
                  timing={convertDate(order.createdAt)}
                  fetchData={fetchData}
                />
              );
            })}
          </ScrollView>
        )}
        <StatusBar style="dark" />
      </View>
      <CheckLocation />
    </>
  );
};
