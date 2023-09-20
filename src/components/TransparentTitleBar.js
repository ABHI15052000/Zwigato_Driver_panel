import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";


const TransparentTitleBar = (props) => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        height: 52,
        marginTop: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        justifyContent: "center",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        // elevation: 5,
        // marginTop:30,
        alignItems:'center'
      }}
    >
      <TouchableOpacity style={{ position: "absolute", left: 20, borderRadius:60, padding:6,alignContent:'center', backgroundColor:'#fff' }} onPress={()=> navigation.goBack()}>
        <MaterialIcons name="arrow-back-ios" size={24} color="grey" paddingLeft={6} />
      </TouchableOpacity>

      <View style={{ }}>
        <Text style={{ fontSize: 18, fontFamily:'Montserrat_400Regular' }}>{props.title}</Text>
      </View>
      
   
    </View>
  );
};

export default TransparentTitleBar;

const styles = StyleSheet.create({});