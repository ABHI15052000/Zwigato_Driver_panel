import {
  View,
  Text,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  FlatList,
  Keyboard,
  StyleSheet,
  Alert,
  StatusBar,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import React, { useState, useEffect, useRef } from "react";
import { TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { ChatMessage } from "../components/ChatMessage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CheckLocation from "../components/CheckLocation";
export const ChatScreen = ({ route }) => {
  const { orderId, Billing_Details, user_id } = route.params;
  // const navigation=useNavigation();
  const [user, setUser] = useState([]);
  const navigation = useNavigation();
  const [data, setData] = useState("");
  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const getDetails = () => {
    AsyncStorage.getItem("name").then((n) => {
      //console.log("hello",n)
      setName(n);
    });
    AsyncStorage.getItem("-photo").then((p) => {
      //console.log("hello" ,p)
      setPhoto(p);
    });
  };
  useEffect(() => {
    getDetails();
  }, []);

  function makeid(length) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
  const chatId = `${orderId}_${user_id}`;
  // console.log(chatId)
  const ref = collection(db, "chat_driver");

  {
    /* Fetch chats and check that if chat already exists than continue chatting otherwise creation of new chat function called */
  }
  useEffect(() => {
    const unsubscribe = onSnapshot(ref, (querySnapshot) => {
      const user = [];
      querySnapshot.forEach((doc) => {
        const { timestamp, chatName } = doc.data();
        user.push({
          id: doc.id,
        });
      });
      setUser(user);
      var count = 0;
      if (user.length > 0) {
        for (let i = 0; i < user.length; i++) {
          if (user[i].id == chatId) {
            count++;
          }
        }
        if (count > 0) {
          setId(chatId);
          // console.log(count,id)
        } else {
          addChat();
        }
      } else addChat();
    });
    return () => unsubscribe();
  }, []);

  const sendmessage = async () => {
    const msg = data.trim();
    if (!msg) {
      // console.log("Kuch daal do msg mein");
      Alert.alert("Please Fill Something !");
      setData("");
      return;
    }
    try {
      setData("");
      const docRef = await addDoc(
        collection(db, `chat_driver/${chatId}/messages`),
        {
          message: msg,
          timestamp: serverTimestamp(),
          senderName: name,
          messageId: Date.now(),
          from: user_id,
          id: makeid(26),
        }
      );
      //setScroll(true)
      // sendtoapi();
      // console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.log("Error adding document: ", e);
    }
  };

  const addChat = async () => {
    //const myDocumentId = "749823_89723608765";
    const documentRef = doc(db, "chat_driver", chatId);
    const documentData = {
      timestamp: serverTimestamp(),
    };

    setDoc(documentRef, documentData)
      .then(() => {
        // console.log('Document added successfully');
        setId(chatId);
        // console.log(id)
      })
      .catch((error) => {
        console.log("Error adding document:", error);
      });
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F3F3F3",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      {/* header */}

      <View
        style={{
          height: 52,
          marginTop: 10,
          backgroundColor: "white",
          borderRadius: 8,
          //width: "92%",
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "center",
          justifyContent: "center",
          //marginBottom: 20,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          marginHorizontal: "4%",
        }}
      >
        <TouchableOpacity
          style={{ position: "absolute", left: 20, zIndex: 5 }}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="grey" />
        </TouchableOpacity>

        <View style={styles.imageview}>
          {photo !== "" ? (
            <Image
              style={styles.image}
              source={{
                uri: photo,
              }}
            />
          ) : (
            <Image
              style={styles.image}
              source={{
                uri: "https://banner2.cleanpng.com/20180725/hrj/kisspng-computer-icons-person-5b58a2a82e0cd6.9562737315325354641886.jpg",
              }}
            />
          )}
          <View style={{ flexDirection: "row" }}>
            <Text style={{ fontSize: 16 }}>
              {name && name.length > 10 ? name.slice(0, 10) + "..." : name}
            </Text>
          </View>
        </View>
      </View>

      {/* {/ order view /} */}

      <View
        style={{
          borderRadius: 10,
          marginHorizontal: "5%",
          backgroundColor: "white",
          marginTop: "4%",
        }}
      >
        <Text
          style={{
            marginTop: 10,
            marginLeft: 10,
            fontSize: 14,
            color: "#394F6B",
            fontFamily: "Montserrat_600SemiBold",
          }}
        >
          Order #{orderId}
        </Text>
        <View style={{ flexDirection: "row" }}>
          <Text
            style={{
              marginLeft: 10,
              fontSize: 14,
              marginBottom: 10,
              fontFamily: "Montserrat_400Regular",
            }}
          >
            Payment :
          </Text>
          <Text
            style={{
              fontSize: 14,
              marginBottom: 10,
              fontFamily: "Montserrat_600SemiBold",
            }}
          >
            {" "}
            $ {Billing_Details}{" "}
          </Text>
        </View>
      </View>

      {/* {/ order view closed /} */}

      <View style={{ flex: 1 }}>
        <ChatMessage idchat={id} user_id={user_id} />
      </View>

      <View
        style={{
          borderRadius: 10,
          padding: 10,
          flexDirection: "row",
          backgroundColor: "white",
          marginTop: 5,
          margin: 20,
          justifyContent: "flex-end",
        }}
      >
        <TextInput
          value={data}
          onChangeText={(t) => {
            setData(t);
          }}
          style={{
            flex: 1,
            alignSelf: "flex-start",
            fontFamily: "Montserrat_400Regular",
          }}
          placeholder="Type a message"
        />
        <TouchableOpacity
          onPress={() => {
            {
              sendmessage();
            }
          }}
        >
          <Feather
            style={{ alignSelf: "flex-end" }}
            name="send"
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>
      <CheckLocation />
      <StatusBar
        barStyle="dark-content"
        hidden={false}
        backgroundColor="#F3F3F3"
        translucent={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainview: {
    borderRadius: 10,
    backgroundColor: "white",
    flexDirection: "row",
    padding: 10,
    marginHorizontal: "5%",
  },
  imageview: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  image: { width: 28, height: 28, borderRadius: 14 },
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
  imageview: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  image: { width: 30, height: 30, borderRadius: 14, marginHorizontal: "2%" },
});
