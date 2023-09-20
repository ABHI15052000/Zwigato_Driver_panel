import { Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState,useRef  } from 'react'
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Button } from '../components/Button';
import { BorderView, ButtonViewHeight, ErrorText, Heading, Main, PhoneInputView, RegisterView, Subheading, TextView, Wrapper } from '../styles/styles';
import CountryPicker from 'react-native-country-picker-modal';
import { PhoneAuthProvider } from 'firebase/auth';
import { auth, firebaseConfig } from '../../firebase';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api';
import CheckLocation from '../components/CheckLocation';


export const RegisterScreen = () => {
  const navigation = useNavigation();
  const [callingCode, setCallingCode] = useState('91')
  const [countryCode, setCountryCode] = useState('IN');
  const [error, setError] = useState(null)
  const [phone, setPhone] = useState('')
  const [verificationId, setVerificationId] = useState("");
  const [show, setShow] = useState(false)
  const [apiError, setApiError] = useState(null)

  recaptchaVerifier = useRef('');
  

  const handleSubmit = async() =>{
    if (!phone) {
      setError("Phone number can't be empty.")
      return;
    }

    if (!/^\d+$/.test(phone)) {
      setError("Phone number must contain only digits.")
      return;
    }
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: phone, CallingCode: callingCode}),
    };

    try {
      await fetch(
        `${api}/auth/Signup`, requestOptions
      ).then((response) => {
        if (!response.ok) {
          response.json().then((data) => {
            if (data.msg) {
              setShow(true)
              setApiError(data.msg)
            } else if(data.message) {
              setShow(true)
              setApiError(data.message)
            } else {
              setShow(true)
              setApiError(data.errors[0].msg)
            }
            setTimeout(() => {
              setShow(false);
            }, 3000);
          });
        }
        else {
          response.json().then((data) => {
            console.log(data);
            AsyncStorage.setItem('token', data.data.token);
          });
          onSignup();
        }

      });
    } catch (error) {
      if (error.message === 'Network request failed'){
        setShow(true)
        setApiError("Network request failed. Please check your internet connection.")
      }
    }

  }

  const onSignup = async () => {
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneProvider.verifyPhoneNumber(
      `+${callingCode}${phone}`,
      recaptchaVerifier.current
    );
    console.log("dsfsdfdsfds", verificationId);

    setVerificationId(verificationId);
    navigation.replace("OTP", {
      verificationId
    })
    } catch (error) {
      if (error.code === 'auth/invalid-phone-number'){
        setShow(true)
        setApiError("Invalid Phone Number.")
      }
    }
    
  };
  

  

  return (
    <Main flex={1}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
      />
      <Wrapper>
        <AntDesign name="arrowleft" size={24} color="white" onPress={() => navigation.replace('Home')} />
        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Subheading>Sign in</Subheading>
        </TouchableOpacity>
      </Wrapper>
      <TextView>
        <Heading>Sign up</Heading>
        <Subheading marginVertical={20}>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Modi ipsa exercitationem excepturi et</Subheading>
      </TextView>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

        <RegisterView flex={1}>
          <BorderView>

            <Text style={{ color: '#808080', position: "absolute", paddingHorizontal:6, top: -10, left: 12, backgroundColor: 'white', fontFamily:"Montserrat_400Regular" }}>Phone</Text>
            <PhoneInputView>
              <CountryPicker
                withFilter
                countryCode={countryCode}
                withFlag
                // withCountryNameButton
                withAlphaFilter={false}
                withCallingCode
                withCurrencyButton={false}
                onSelect={country => {
                  const { cca2, callingCode } = country;
                  setCountryCode(cca2)
                  setCallingCode(callingCode[0])
                }}
                containerButtonStyle={{
                  alignItems: "center",
                  marginRight: -10,
                }}
              />
              <Text style={{ fontSize: 20 }}> <AntDesign name="down" size={12} color="black" /> | </Text>
              <TextInput value={phone} flex={1} 
                onChangeText={text => {
                  setPhone(text)
                  setError(null)
                }} 
                style={{
                  fontFamily:"Montserrat_400Regular"
                }}
                mode="outlined" keyboardType={'phone-pad'} maxLength={10} placeholder='Phone'
              />
            </PhoneInputView>
          </BorderView>
          {error && <ErrorText>{error}</ErrorText>}

          <ButtonViewHeight paddingBottom={15}>
            <Button onPress={handleSubmit} title="Sign up" />
          </ButtonViewHeight>
        </RegisterView>
      </ScrollView>

      <Snackbar
        visible={show}
        onDismiss={() => setShow(false)}
      >
        {apiError}
      </Snackbar>
      <CheckLocation/>
      <StatusBar style="light" />
    </Main>
  )
}
