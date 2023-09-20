import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { StatusBar } from "expo-status-bar";
import styled from "styled-components/native";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { Avatar } from "react-native-elements";
import { BlackButton } from "../components/Button";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CountryPicker from "react-native-country-picker-modal";
import TextInputs from "../components/TextInputs";
import { api } from "../../api";
import { Snackbar } from "react-native-paper";
import CheckLocation from "../components/CheckLocation";
import Titlebar from "./../components/TitileBar";
import { codeFinder } from "../components/CountryCode";
import {
  ActivityIndicatorView,
  GreenText,
  Heading,
  Subheading,
} from "../styles/styles";
const MView = styled.View`
flex:1;
background-color:white
margin-top:10px;
`;
const TopView = styled.View`
  margin-top: 15px;
  flex-direction: row;
  border: 1px;
  border-color: white;
  padding: 10px;
  margin: 10px;
  width: 95%;
  elevation: 5;
  margin: 10px;
  border-radius: 8px;
  background-color: white;
`;
const MText = styled.Text`
  font-family: "Montserrat_600SemiBold";
  align-self: center;
`;
const AvatarView = styled.View`
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`;
const AvatarText = styled.Text`
margin-top:10px;
font-size:22px;
text-align:center;
color:black
font-family:"Montserrat_600SemiBold"
`;

const BorderView = styled(View)`
  border: 1px solid lightgrey;
  padding: 5px 20px;
  border-radius: 5px;
  margin: 10px 0px;
`;
const PhoneInputView = styled(View)`
  padding-vertical: 4px;
  flex-direction: row;
  align-items: center;
`;
const FterView = styled.View`
flex:1
background-color:white;
width:100%;
border-top-left-radius:20px;
border-top-right-radius:20px;
padding:10px;

`;
const EditProfile = ({ route }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editable, setEditable] = useState(false);
  const [buttonText, setButtonText] = useState("Edit Profile");
  const [photo, setPhoto] = useState();
  const [callingCode, setCallingCode] = useState("91");
  const [countryCode, setCountryCode] = useState("IN");
  const [error, setError] = useState("");
  const [error1, setError1] = useState("");
  const [error2, setError2] = useState("");
  const [error3, setError3] = useState("");
  const navigation = useNavigation();
  const [authToken, setAuthToken] = useState("");
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mainLoading, setMainLoading] = useState(true);
  const [save, setSave] = useState(false);
  AsyncStorage.getItem("token").then((token) => {
    setAuthToken(token);
  });

  async function getApi() {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    };
    const response = await fetch(`${api}/getuser`, requestOptions);
    const json = await response.json();
    return json;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const json = await getApi();
        if (json && json.data.phone) {
          setPhone(json.data.phone);
          const callCode = json.data.calling_code;
          const flag = codeFinder(callCode);
          setCountryCode(flag);
        }
        if (json && json.data) {
          setName(json.data.name);
          setEmail(json.data.email);
          setAddress(json.data.address);
          setPhoto(api + "/" + json.data.photo_uri);
          // console.log("mein get hu bhai- edit ka",json);
          setMainLoading(false);
        } else {
          // console.log("Error: json or json.data is undefined or null.");
          setMainLoading(true);
        }
      } catch (error) {
        setMainLoading(false);
        console.log("Error fetching data:", error);
      }
    };
    fetchData();
  }, [authToken, handleSavePress, phone]);

  const handleSavePress = () => {
    const nameRegex = /^[a-zA-Z ]{2,30}$/;
    const addressRegex =
      /^[a-zA-Z0-9\s\-\#\,\.]*[a-zA-Z][a-zA-Z0-9\s\-\#\,\.]*$/;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    // const phoneRegex = /^[0-9]{10}$/;
    if (!nameRegex.test(name) || !name) {
      setError("Invalid Name", "Please enter a valid name.");
      return;
    }
    if (!emailRegex.test(email) || !email) {
      setError1("Invalid Email", "Please enter a valid email address.");
      return;
    }
    // if (!phoneRegex.test(phone)) {
    //   setError2("Invalid Phone", "Please enter a valid 10-digit phone number.");
    //   return;
    // }
    if (!addressRegex.test(address) || !address) {
      setError3(
        "Invalid Address",
        "Please enter a valid 10-digit phone number."
      );
      return;
    }
    setLoading(true);

    setEditable(false);
    setMainLoading(true);
    setSave(true);
    handleUpdate();
    // handleSubmit();
    setButtonText("Edit Profile");
  };
  const handleEditPress = () => {
    setEditable(true);
    setButtonText("Save");
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setModalVisible(false);
    if (status === "granted") {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.5,
      });
      if (!result.canceled) {
        const photoUri = result.assets[0].uri;
        setPhoto(photoUri);
        console.log(photoUri);
        await AsyncStorage.setItem("-photo", photoUri);
      }
    } else {
      alert("Camera permission not granted");
    }
  };
  const getProfilePicture = async () => {
    const photoUri = await AsyncStorage.getItem(`-photo`);
    setPhoto(photoUri);
  };

  useFocusEffect(
    useCallback(() => {
      getProfilePicture();
    }, [])
  );
  const pickImage = useCallback(async () => {
    setModalVisible(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });
      if (!result.canceled) {
        console.log(result);

        const photoUri = result.assets[0].uri;
        setPhoto(photoUri);
        console.log(photoUri);
        await AsyncStorage.setItem("-photo", photoUri);
        // code to handle the taken photo
        // console.log("from gallery", photoUri)
      }
    } catch (error) {
      console.log(error);
    }
  }, [photo]);

  const formdata = new FormData();

  const handleUpdate = async () => {
    // setLoading(true)
    formdata.append("photo_uri", {
      uri: photo,
      name: "image.jpg",
      type: "image/jpeg",
    });

    formdata.append("name", name);
    formdata.append("email", email);
    formdata.append("phone", phone);
    formdata.append("address", address);
    formdata.append("calling_code", callingCode);
    console.log("=-=-=-=-=-=-=============", authToken);
    const requestOptions = {
      method: "POST",
      headers: {
        // "Content-Type":"multipart/form-data; boundary=???",
        Authorization: `Bearer ${authToken}`,
      },
      body: formdata,
    };

    try {
      await fetch(`${api}/update`, requestOptions).then((response) => {
        // console.log(JSON.stringify(response));
        response.json().then((data) => {
          console.log("update hu dost", data);
          setShow(true);
          setMessage("Profile Updated Successfully.");
        });
      });
      setLoading(false);
      // setMainLoading(false)
      setSave(false);
    } catch (error) {
      console.log(error);
      setMainLoading(false);
      setSave(false);
      if (error.message === "Network request failed") {
        setEditable(true);
        setButtonText("Save");
        setShow(true);
        setMessage("Unable to save data. Please save again");
      }
      setLoading(false);
    } finally {
      setSave(false);
      setMainLoading(false);
    }
  };
  return (
    <>
      {mainLoading && (
        <View>
          <Modal animationType="slide" transparent={true} visible={mainLoading}>
            <View style={styles.centeredVieW}>
              <View style={styles.modalVieW}>
                <ActivityIndicator size={40} />
              </View>
            </View>
          </Modal>
        </View>
      )}

      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <MView>
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
                <Text style={styles.modalText}>Choose an Option</Text>
                <View style={{ flexDirection: "row" }}>
                  <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={pickImage}
                  >
                    <Text style={styles.textStyle}>Gallery</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={handleTakePhoto}
                  >
                    <Text style={styles.textStyle}>Camera</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
          {/* <TopView>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="left" size={24} color="black" />
          </TouchableOpacity>
          <MText> {editable ? 'Edit Profile' : 'Profile'} </MText>
        </TopView> */}

          <View
            marginHorizontal="4%"
            marginTop={-8}
            pointerEvents={mainLoading ? "none" : "auto"}
          >
            <Titlebar title={editable ? "Edit Profile" : "Profile"} />
          </View>

          <AvatarView>
            {!photo && (
              <Avatar
                rounded
                size="xlarge"
                source={{
                  uri: "https://e7.pngegg.com/pngimages/178/595/png-clipart-user-profile-computer-icons-login-user-avatars-monochrome-black-thumbnail.png",
                }}
                activeOpacity={0.7}
              />
            )}
            {photo && (
              <Avatar
                rounded
                size={180}
                source={{ uri: photo }}
                backgroundColor="#2182BD"
              />
            )}

            {editable ? (
              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 100,
                  bottom: 10,
                  backgroundColor: "#0C8A7B",
                  borderRadius: 27,
                  padding: 10,
                }}
                onPress={() => setModalVisible(true)}
              >
                <Entypo
                  name="camera"
                  size={30}
                  color="white"
                  style={[styles.button, styles.buttonOpen]}
                />
              </TouchableOpacity>
            ) : null}
          </AvatarView>
          <AvatarText>{name}</AvatarText>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <FterView flex={1}>
              <TextInputs
                label="Name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError(null);
                }}
                disabled={!editable}
                mode="outlined"
                maxlen={30}
              />
              {error && <Text style={{ color: "red" }}>{error}</Text>}
              <TextInputs
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError1(null);
                }}
                disabled={!editable}
                mode="outlined"
              />
              {error1 && <Text style={{ color: "red" }}>{error1}</Text>}
              <BorderView>
                <Text
                  style={{
                    position: "absolute",
                    paddingHorizontal: 6,
                    top: -10,
                    left: 7,
                    backgroundColor: "white",
                    fontSize: 12,
                    fontFamily: "Montserrat_600SemiBold",
                    color: "lightgrey",
                  }}
                >
                  Phone
                </Text>
                <PhoneInputView>
                  <View style={{ pointerEvents: "none" }}>
                    <CountryPicker
                      withFilter
                      countryCode={countryCode}
                      withFlag
                      // withCountryNameButton
                      withAlphaFilter={false}
                      withCallingCode
                      withCurrencyButton={false}
                      onSelect={(country) => {
                        // console.log(country)
                        const { cca2, callingCode } = country;
                        setCountryCode(cca2);
                        setCallingCode(callingCode[0]);
                      }}
                      containerButtonStyle={{
                        alignItems: "center",
                        marginRight: -10,
                        pointerEvents: "none",
                      }}
                      disabled
                    />
                  </View>
                  <Text style={{ fontSize: 14, color: "lightgrey" }}> | </Text>
                  <TextInput
                    value={phone}
                    flex={1}
                    onChangeText={(text) => {
                      setPhone(text), setError2(null);
                    }}
                    mode="outlined"
                    keyboardType={"phone-pad"}
                    maxLength={15}
                    editable={false}
                  />
                  {error2 && <Text style={{ color: "red" }}>{error2}</Text>}
                </PhoneInputView>
              </BorderView>
              <TextInputs
                label="Address"
                value={address}
                onChangeText={(text) => {
                  setAddress(text), setError3(null);
                }}
                disabled={!editable}
                mode="outlined"
              />
              {error3 && <Text style={{ color: "red" }}>{error3}</Text>}

              <View marginTop="auto">
                <BlackButton
                  title={buttonText}
                  onPress={editable ? handleSavePress : handleEditPress}
                />
              </View>
            </FterView>
          </ScrollView>
          <Snackbar
            visible={show}
            duration={1000}
            onDismiss={() => setShow(false)}
          >
            {message}
          </Snackbar>

          <StatusBar style="dark" />
        </MView>
        <CheckLocation />
      </SafeAreaView>
    </>
  );
};

export default EditProfile;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "center",
  },
  camera: {
    flex: 1,
    aspectRatio: 1,
  },
  cameraContainer: {
    flex: 1,
    flexDirection: "column",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonClose: {
    borderRadius: 10,
    backgroundColor: "#0C8A7B",
    padding: 10,
    marginBottom: 10,
    marginRight: 5,
    marginLeft: 5,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    backgroundColor: "#0C8A7B",
    padding: 10,
    color: "white",
    borderRadius: 10,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  centeredVieW: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalVieW: {
    margin: 20,

    borderRadius: 20,
    width: "70%",
    height: "20%",
    justifyContent: "center",
    alignItems: "center",
  },
});
