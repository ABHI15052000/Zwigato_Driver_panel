import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { AntDesign } from '@expo/vector-icons';
import { Image } from 'react-native';
import styled from 'styled-components/native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Avatar } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firebaseConfig } from '../../firebase';
import { signOut } from 'firebase/auth';
import { api } from '../../api';
const AvatarView = styled.View`
margin-left:3%;
// margin-right:10px
margin-bottom:10px;
`
export const Sidebar = ({ isOpen, onClose  }) => {
  
  const [activeTab, setActiveTab] = useState('');
 const navigation = useNavigation();
 const [isNavigating,setIsNavigating]=useState(false)

  const handleTabPress = (tab) => {
    if(!isNavigating){
      setIsNavigating(true)
      setActiveTab(tab);
      onClose();
      setTimeout(() => {
        
        navigation.navigate("DriverHome")
      },300);
      setActiveTab(null);
    }
  };
  const handleTab1Press = (tab) => {
    if(!isNavigating){
      setIsNavigating(true)
      setActiveTab(tab);
      onClose();
      setTimeout(() => {
        
        navigation.navigate("EditProfile")
      }, 300);
      setActiveTab(null);
    }
  };
  const handleTab2Press = (tab) => {
    if(!isNavigating){
      setIsNavigating(true)
      setActiveTab(tab);
    setActiveTab(null);
    onClose();
    setTimeout(() => {
      navigation.navigate("Orders")
    }, 300);
    }
    
  };
  const handleTab3Press = (tab) => {
    if(!isNavigating){
      setIsNavigating(true)
      setActiveTab(tab);
    onClose();
    setTimeout(()=>{

      navigation.navigate("Notifications")
    },300)
    setActiveTab(null);
    }
    
  };
  const handleTab4Press = (tab) => {
    if(!isNavigating){
      setIsNavigating(true)
      setActiveTab(tab);
      onClose();
      setTimeout(()=>{
  
        navigation.navigate("Ratings")
      },300)
      setActiveTab(null);
    }
   
  };
  const handleTabSupportPress = (tab) => {
    if(!isNavigating)
    {
      setIsNavigating(true)
      setActiveTab(tab);
    onClose();
    setTimeout(()=>{

      navigation.navigate("Support")
    },300)
    setActiveTab(null);
    }
    
  };

  const handleTab5Press = async (tab) => {
    setActiveTab(tab);
    let token = "";
    try {
      token = await AsyncStorage.getItem('token');
    } catch (error) {
      console.log('Error retrieving token:', error);
    }
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
    };

    try {
      const response = await fetch(`${api}/auth/logout`, requestOptions);
      console.log("logout testing ", response.ok)
      const json = await response.json();
      console.log(json);
      AsyncStorage.clear();
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      onClose();
    } catch (error) {
      console.log("afsljkasjkfj",error);
    }

    // try {
    //   // AsyncStorage.removeItem(`-photo`);
    //   // AsyncStorage.removeItem('name');
    //   // AsyncStorage.removeItem('creationTime')
    //   // AsyncStorage.removeItem('token');

    //   AsyncStorage.clear();
    //   await signOut(auth);
    //   navigation.reset({
    //     index: 0,
    //     routes: [{ name: 'Login' }],
    //   });
    //   onClose();


    // } catch (error) {
    //   console.log(error);
    // }
  };
  
  // const handleTab5Press = (tab) => {
  //   setActiveTab(tab);
  //   signOut(auth);
  //   navigation.replace("Home")
  //   onClose();
  // };
  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState("")
  const [authToken, setAuthToken] = useState('');

  AsyncStorage.getItem('token').then((token) => {
    setAuthToken(token)
  });
  const getProfilePicture = async () => {
    const photoUri = await AsyncStorage.getItem(`-photo`);
    const nameGet = await AsyncStorage.getItem('name')
    setName(nameGet);
    setPhoto(photoUri);
    // getApi();
  };
  useFocusEffect(
    useCallback(() => {
      getProfilePicture();
      setIsNavigating(false)
    }, [])
  );
  if (isOpen) {
    if (isNavigating) {
      console.log("gauravpagi")
      setIsNavigating(false)
    }
  }
 
  const fetchData = useCallback(async () => {
    console.log("hRaghs")
    setIsNavigating(false)
    const requestOptions = {
            method: "GET",
            headers: { "Content-Type": "application/json",'Authorization': `Bearer ${authToken}` },
          };

    try{
      const response = await fetch(`${api}/getuser`,requestOptions);
        const json = await response.json();
        setName(json.data.name);
        setPhoto(api+"/"+json.data.photo_uri)
        if(json.data.name){

          AsyncStorage.setItem('name', json.data.name);
        }else{
          AsyncStorage.removeItem('name');
        }
        // console.log(json.data)
    }catch(error){

      // console.log("Error: json or json.data is undefined or null.");
    }
    
},[name]);

useFocusEffect(
  useCallback(()=>{
    fetchData();
  },[fetchData])
)  


  return (
    <Modal isVisible={isOpen} onBackdropPress={onClose} 
    onRequestClose={() => {
      onClose();
    }}
    style={styles.modal} animationIn="slideInLeft"
    animationOut="slideOutLeft">
      <View style={styles.container}>
      <AvatarView>
            {!photo && (
            <Avatar
            rounded
            size="large"
            source={{
                uri:
                'https://e7.pngegg.com/pngimages/178/595/png-clipart-user-profile-computer-icons-login-user-avatars-monochrome-black-thumbnail.png',
            }}
            activeOpacity={0.7}
            />
          )}
          {photo && (
            <Avatar
            rounded
              size="large"
              source={{ uri: photo }}
              backgroundColor="#2182BD"
            />
          )}
        
        </AvatarView>
        <Text style={{marginLeft:"4%",fontFamily:"Montserrat_500Medium"}}>{name}</Text>
        <View style={{flexDirection: 'row',width:500 ,marginLeft:-20,marginTop:10 ,width:"110%",marginBottom:10}}>
        <View style={{flex: 1, height: 1, backgroundColor: 'black'}} />
        </View>
        <TouchableOpacity style={styles.tab} onPress={() => handleTabPress('DriverHome')}>
            <View style={{flexDirection:"row"}}>
              <Image source={require("../../assets/home.png")} style={{width:26,height:26 ,marginRight:10}}/>
              <Text style={[styles.tabText, activeTab === 'DriverHome' && styles.activeTabText ,]}>Home</Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => handleTab1Press('profile')}>
            <View style={{flexDirection:"row"}}>
              <Image source={require("../../assets/user.png")} style={{width:30,height:30 ,marginRight:10}}/>
              <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profile</Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => handleTab2Press('OrderHistory')}>
            <View style={{flexDirection:"row"}}>
              <Image source={require("../../assets/Order.png")} style={{width:26,height:26 ,marginRight:10}}/>
              <Text style={[styles.tabText, activeTab === 'OrderHistory' && styles.activeTabText]}>Order History</Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => handleTabSupportPress('Support')}>
            <View style={{flexDirection:"row"}}>
              <Image source={require("../../assets/support.png")} style={{width:30,height:26 ,marginRight:10}}/>
              <Text style={[styles.tabText, activeTab === 'Support' && styles.activeTabText]}>Support</Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() =>handleTab3Press('Notification')}>
            <View style={{flexDirection:"row"}}>
              <Image source={require("../../assets/noti.png")} style={{width:22,height:28 ,marginRight:10}}/>
              <Text style={[styles.tabText, activeTab === 'Notification' && styles.activeTabText]}>Notification</Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() =>handleTab4Press('Rating&Reviews')}>
            <View style={{flexDirection:"row"}}>
              <Image source={require("../../assets/review.png")} style={{width:26,height:28 ,marginRight:10}}/>
              <Text style={[styles.tabText, activeTab === 'Rating&Reviews' && styles.activeTabText]}>Rating & Reviews</Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() =>handleTab5Press('Logout')}>
            <View style={{flexDirection:"row"}}>
              <Image source={require("../../assets/Logout.png")} style={{width:22,height:24 ,marginRight:10}}/>
              <Text style={[styles.tabText, activeTab === 'Logout' && styles.activeTabText]}>Logout</Text>
            </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const CustomSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSidebarOpen = () => {
    setIsOpen(true);
  };

  const handleSidebarClose = () => {
    setIsOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={handleSidebarOpen} style={{marginTop:1}}>
        <Image source={require("../../assets/side.png")} style={{width:30,height:30}}/>
        
      </TouchableOpacity>
      <Sidebar isOpen={isOpen} onClose={handleSidebarClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    // flex: 1,
    // position:"absolute",
    flexDirection: 'row',
  },
  modal: {
    margin: 0,
    alignItems: 'flex-start',
    width:400
    // justifyContent: 'flex-end',
    // bottom:500
  },
  container: {
    backgroundColor: '#fff',
    padding: 20,
    width:"75%",
    height:"100%"
  },
  tab: {
    paddingVertical: 5,
    // paddingHorizontal: 20,
    marginBottom: 10,
  },
  tabText: {
    fontSize: 14,
    fontFamily:"Montserrat_500Medium",
    alignSelf:'center'
  },
  activeTabText: {
    color: "#FF9C1C",
  },
});

export default CustomSidebar;
