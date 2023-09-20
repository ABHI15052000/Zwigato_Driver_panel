import { Text, View, FlatList, Image, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import React, { useState, useEffect } from "react";
import moment from "moment";
import Titlebar from "../components/TitileBar";
import Stars from "../components/Stars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../api";
import CheckLocation from "../components/CheckLocation";
// const DATA = [
//   {
//     id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
//     name: "Adam",
//     uri: "https://images.unsplash.com/photo-1610043809095-9c87fe936e03?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=435&q=80",
//     title: "First Item",
//     comment:
//       "Lorem ipsum dolor sit amet consectetur. Cursus risus metus sit arcu lectus arcu iaculis eget ullamcorper. Ornare id ut nullasdf euismod tortor nec.",
//   },
//   {
//     id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
//     name: "Eric",
//     uri: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80",
//     title: "Second Item",
//     comment:
//       "Lorem ipsum dolor sit amet consectetur. Cursus risus metus sit arcu lectus arcu iaculis eget ullamcorper. Ornare id ut nullasdf euismod tortor nec.",
//   },
//   {
//     id: "58694a0f-3da1-471f-bd96-145571e29d72",
//     name: "John",
//     uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
//     title: "Third Item",
//     comment:
//       "Lorem ipsum dolor sit amet consectetur. Cursus risus metus sit arcu lectus arcu iaculis eget ullamcorper. Ornare id ut nulla euismod tortor nec. Lorem ipsum dolor sit amet consectetur. Cursus",
//   },
// ];

const Ratings = () => {
  const [data, setData] = useState()
  const [authToken, setAuthToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    getArticles();
    setRefreshing(false);
  };

  AsyncStorage.getItem("token").then((token) => {
    setAuthToken(token);
  });
  const getArticles = async () => {
    let token =""
    try {
      token = await AsyncStorage.getItem('token');
      setAuthToken(token);
    } catch (error) {
      console.log('Error retrieving token:', error);
    }
  
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await fetch(
        `${api}/feedback/driver_feedback`, requestOptions
      );
      // console.log(response.ok);
      const json = await response.json();
      // console.log(json.data[3]);
      setData(json.data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    getArticles();
  }, [authToken]);
  // console.log(data)
  // if (isLoading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <ActivityIndicator size="large" color="#0C8A7B" />
  //     </View>
  //   );
  // }
  const renderItem = ({ item }) => {
    // console.log(item);
    if (!item.customer) {
      return null;
    }
    return (
      <View
        style={{
          borderBottomWidth: 0.5,
          width: "100%",
          marginVertical: 10,
          borderColor: "grey",
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Image
            source={{ uri: api+'/'+item.customer.photo_uri || "https://img.freepik.com/premium-vector/avatar-profile-colorful-illustration-2_549209-82.jpg"  }}
            // source={{ uri: "https://img.freepik.com/premium-vector/avatar-profile-colorful-illustration-2_549209-82.jpg" }}
            style={{ width: 50, height: 50, borderRadius: 25, marginRight: 15 }}
          />
          <View style={{}}>
            <Text style={{ fontSize: 16,fontFamily: "Montserrat_600SemiBold", marginBottom: 5 }}>
              {item.customer.name.split(" ")[0] || "User"}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 12,
                width:"76%"
              }}
            >
              <Stars numberOfStars={item.stars} maxStars={5} size={22} />

              <Text style={{ fontSize: 12, color: "#828A89",fontFamily: "Montserrat_400Regular" }}>
                {moment(item.createdAt).fromNow()}
              </Text>
            </View>
            <Text
              style={{
                marginBottom: 20,
                lineHeight: 20,
                width: 300,
                color: "#828A89",
                fontFamily: "Montserrat_400Regular",
              }}
            >
              {item.comment}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={{ marginHorizontal: 20, marginBottom:10,flex:1 }}>
        <Titlebar title="Ratings" />
        {data && data.length > 0 ? (
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}/>
            }
          />
        ) : (
            <>
              {
                isLoading ? 
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#0C8A7B" />
                  </View>
                  :

          <View style={styles.rating}>
            <Text style={styles.ratingText}>No ratings yet ⭐⭐</Text>
          </View>
              }
            
            </>
        )}
      </View>
      <CheckLocation/>
    </>
  );
  
};

export default Ratings;

const styles = StyleSheet.create({
  rating:{
    // flex:1,
    justifyContent:'center',
    alignItems:'center',
    
  },
  ratingText:{
    fontFamily:"Montserrat_600SemiBold",
    fontSize:20,
  }
})
