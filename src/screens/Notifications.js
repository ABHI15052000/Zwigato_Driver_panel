import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import moment from "moment/moment";
import Titlebar from "../components/TitileBar";
import { api } from './../../api';
import AsyncStorage from "@react-native-async-storage/async-storage";
import CheckLocation from "../components/CheckLocation";
// const DATA = [
//   {
//     id: 1,
//     note: "Your order will be shipped, once we get your confirm address",
//   },
//   {
//     id: 2,
//     note: "Your order will be shipped, once we get your confirm address",
//   },
//   {
//     id: 3,
//     note: "Your order will be shipped, once we get your confirm address",
//   },
//   {
//     id: 4,
//     note: "Your order will be shipped, once we get your confirm address",
//   },
// ];

const Notifications = () => {
  const [data, setData] = useState();
  const [authToken, setAuthToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // const focusEvent = Platform.OS === "android" ? 'focus':'change';
  const onRefresh = () => {
    // Set refreshing state to true
    setRefreshing(true);
  
    getArticles();
    // After completing the refreshing logic, set refreshing state to false
    setRefreshing(false);
  };
  
  AsyncStorage.getItem("token").then((token) => {
    setAuthToken(token);
  });
  const getArticles = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    };
    try {
      // const response = await fetch(api + "notification/list_notifications");
      const response = await fetch(`${api}/notification/list_notifications`, requestOptions);
      const json = await response.json();
      // console.log(json);
      if(json){
        setData(json.data);
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(authToken){

      getArticles();
    }
    // console.log(data);
  }, [authToken]);

  // if (isLoading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <ActivityIndicator size="large" color="#0C8A7B" />
  //     </View>
  //   );
  // }
  
  // if (data && data.length === 0) {
    
  //   return (
  //     <>
  //     <View style={{ marginHorizontal:"5%", marginTop:15}}>
  //       <Titlebar title={"Notifications"} />
  //     </View>
  //     <View style={styles.notification}>
  //           <Text style={styles.notificationText}>No Notifications yet ⭐⭐</Text>
  //         </View>
  //     </>
  //   );
  // }

  return (
    <View flex={1}>
      <View style={{ marginHorizontal:"5%"}}>
        <Titlebar title={"Notifications"} />
      </View>
      {/* <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "white",
              marginBottom: 20,
              marginHorizontal: "5%",
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 15,fontFamily: "Montserrat_400Regular", }}>{item.text}</Text>
            <Text style={{ fontSize: 12,fontFamily: "Montserrat_400Regular", color: "grey", marginTop: 7 }}>
              {moment(item.createdAt).fromNow()}
            </Text>
          </View>
        )}
      /> */}
        {data && data.length > 0 ? (
          <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "white",
                marginBottom: 20,
                marginHorizontal: "5%",
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 15,fontFamily: "Montserrat_400Regular", }}>{item.text}</Text>
              <Text style={{ fontSize: 12,fontFamily: "Montserrat_400Regular", color: "grey", marginTop: 7 }}>
                {moment(item.createdAt).fromNow()}
              </Text>
            </View>
          )}
        />
        ) : (
            <>
              {
                isLoading ? 
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#0C8A7B" />
                  </View>
                  :

          <View style={styles.notification}>
            <Text style={styles.notificationText}>No Notifications yet ⭐⭐</Text>
          </View>
              }
            
            </>
      )}
      <View marginTop="auto">

      <CheckLocation/>
      </View>
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  notification:{
    // flex:1,
    justifyContent:'center',
    alignItems:'center',
    
  },
  notificationText:{
    fontFamily:"Montserrat_600SemiBold",
    fontSize:20,
  }
})
