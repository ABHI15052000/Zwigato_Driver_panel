import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Snackbar } from "react-native-paper";
import Titlebar from "../components/TitileBar";
import CustomOutlinedTextInput from "../components/CustomOutlinedTextInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../api";
import CheckLocation from "../components/CheckLocation";
const Feedback = ({route}) => {
  const { driver_orderId } = route.params;
  const navigation = useNavigation();
  const [authToken, setAuthToken] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [driverName, setDriverName] = useState('')
  AsyncStorage.getItem("token").then((token) => {
    setAuthToken(token);
  });
  const StarRating = () => {
    const handleRating = (index) => {
      setPressed(true);
      setRating(index);
      // console.log(rating);
    };

    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const name = i <= rating ? "star" : "star-outline";
      const color = pressed && i <= rating ? "#ffd700" : "#c7c7c7";
      stars.push(
        <TouchableOpacity key={i} onPress={() => handleRating(i)}>
          <Ionicons name={name} size={34} color={color} />
        </TouchableOpacity>
      );
    }
    return <View style={styles.container}>{stars}</View>;
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setSnackbarVisible(true);
    } else {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ comment: comment, stars: rating, order_id: driver_orderId  }),
      };

      try {
        await fetch(
          `${api}/feedback/save`,
          requestOptions
        ).then((response) => {
          response.json().then((data) => {
          });
        });
      } catch (error) {
        console.log(error);
      }
      navigation.goBack();
    }
    
  };

  useEffect(()=>{
    getDriverData();
  },[authToken,driverName])

  const getDriverData = async() =>{
    console.log("a gya mai", driver_orderId);
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    };
    try {
      await fetch(
        `${api}/feedback/driver_feedback/${driver_orderId}`,
        requestOptions
      ).then((response) => {
        response.json().then((data) => {
          console.log("fsdfsdfds", data.User.name);
          setDriverName(data.User.name)

        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <View style={{width:"90%", marginTop:5}}>
        <Titlebar title={"Reviews"} />
      </View>
      <View
        style={{
          height: "77%",
          width: "90%",
          alignItems: "center",
        }}
      >
        <Image
          style={{
            width: 110,
            height: 110,
            borderRadius: 55,
          }}
          source={{
            uri: "file:///data/user/0/com.zwigato/cache/ImagePicker/3eac1023-9e61-4ae4-855a-5e8e47f74851.jpeg",
          }}
        />
        <Text
          style={{
            fontSize: 24,
            fontWeight: "600",
            marginTop: 11,
            marginBottom: 14,
          }}
        >
          {driverName}
        </Text>
        <View
          style={{
            flexDirection: "row",
            width: "55%",
            justifyContent: "space-around",
          }}
        >
          <StarRating />
        </View>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "600",
            marginTop: 10,
            marginBottom: 5,
          }}
        >
          Feedback
        </Text>
        <Text>Share your feedback for driver</Text>

        <CustomOutlinedTextInput
          multiline={true}
          onChangeText={(text) => setComment(text)}
          value={comment}
          label={"Comment"}
          width={350}
        />
      </View>
      <TouchableOpacity
        onPress={() => handleSubmit()}
        style={{
          backgroundColor: "black",
          height: 50,
          width: "90%",
          borderRadius: 7,
          justifyContent: "center",
          alignItems: "center",
          marginTop:"5%"
        }}
      >
        <Text style={{ color: "white" }}>Submit</Text>
      </TouchableOpacity>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {rating === 0 || comment === ""
          ? "Please enter a comment and rating"
          : ""}
      </Snackbar>
      <CheckLocation/>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default Feedback;
