import { Text, TouchableOpacity, TextInput ,ActivityIndicator } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Button } from '../components/Button';
import { PhoneView, Heading, Main, Subheading, ButtonViewHeight, TextView, Wrapper, BorderView, PhoneInputView, SignupView, ErrorText, ActivityIndicatorView } from '../styles/styles';
import CountryPicker from 'react-native-country-picker-modal'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { auth, firebaseConfig } from '../../firebase';
import { Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api';
import CheckLocation from '../components/CheckLocation';

export const LoginScreen = () => {
  const navigation = useNavigation();
  const [show, setShow] = useState(false);
  const [callingCode, setCallingCode] = useState('91')
  const [countryCode, setCountryCode] = useState('IN');
  const [phone, setPhone] = useState('')
  const [verificationId, setVerificationId] = useState("");
  const [error, setError] = useState(null)
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false)
  // console.log(callingCode);
  recaptchaVerifier = useRef('');

  useEffect(() => {
    const checkAutoLogin = async () => {
      // Retrieve the stored JWT token and creation time from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      const creationTime = await AsyncStorage.getItem('creationTime');
      const sucess = await AsyncStorage.getItem("Sucess"); 
  
      if (token && creationTime && sucess) {
        const currentTime = new Date().getTime();
        const tokenCreationTime = new Date(parseInt(creationTime, 10));
  
        // Check if the token is within the desired timeframe (e.g., 1 week)
        const weekInMilliseconds = 15 * 24 * 60 * 60 * 1000;
        if (currentTime - tokenCreationTime <= weekInMilliseconds) {
          navigation.replace("DriverHome"); // Replace with the appropriate screen name
        }
      } else {
        // Redirect the user to the login screen
        AsyncStorage.clear();
        setLoading(false);
      }
    };
  
    checkAutoLogin();
  }, []);


  function onCaptcha() {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible',
        'callback': () => { onSignup },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          // ...
        }
      }, auth);
    }
    else{
      setLoginLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!phone) {
      setError("Phone number can't be empty.")
      return;
    }

    if (!/^\d+$/.test(phone)) {
      setError("Phone number must contain only digits.")
      return;
    }
    setLoginLoading(true)
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: phone, CallingCode: callingCode}),

    };

    try {
      await fetch(
        `${api}/auth/Driver/Signin`, requestOptions
      ).then((response) => {
        // console.log("signin",response.ok);
        if (!response.ok) {
          response.json().then((data) => {
            if (data.message) {
              setShow(true)
              setLoginLoading(false)
              setApiError(data.message)
            }else if(data.msg) {
              setShow(true)
              setLoginLoading(false)

              setApiError(data.msg)
            }  else {
              setShow(true)
              setLoginLoading(false)
              setApiError(data.errors[0].msg)
            }
            setTimeout(() => {
              setShow(false);
            }, 3000);
          });
        }
        else {
          response.json().then((data) => {
            AsyncStorage.setItem('token', data.data.token);
            AsyncStorage.setItem('creationTime', new Date().getTime().toString());
          });
          setLoginLoading(false)
          onSignup();
        }

      });
    } catch (error) {
      // console.log(error);
      
      if (error.message === 'Network request failed') {
        setShow(true)
        setApiError("Network request failed. Please check your internet connection.")
      }
      if (error.message === "too-many-requests") {
        setShow(true);
        setApiError("Too Many Requests Try after 15 minutes")
      }
      setLoginLoading(false)
    }

  }


  const onSignup = () => {

    onCaptcha();

    const appVerifier = recaptchaVerifier.current;
    signInWithPhoneNumber(auth, `+${callingCode}${phone}`, appVerifier)
      .then((confirmationResult) => {
        setVerificationId(confirmationResult.verificationId);
        setPhone('')
        setLoginLoading(false);
        navigation.replace("OTP", {
          verificationId: confirmationResult.verificationId,
          phoneNumber: `+${callingCode}${phone}`,
        });
      }).catch((error) => {
        if (error.message === 'Firebase: Error (auth/too-many-requests).') {
          setShow(true)
          setApiError("Too2-many-requests try after 15 minutes")
        }
        else {
          // Cancelled reCAPTCHA, clear token from AsyncStorage
          AsyncStorage.removeItem('token');
          AsyncStorage.removeItem('creationTime');
          setLoading(false);
        }
      });
  }



  return (
    <Main flex={1}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
      />

{loading ? (
  <ActivityIndicatorView >

        <ActivityIndicator size="large" color="#0C8A7B" />
  </ActivityIndicatorView>
      ) : (
        <>


      <Wrapper>
        {/* <AntDesign name="arrowleft" size={24} color="white" onPress={() => navigation.replace('Home')} />
        <TouchableOpacity onPress={() => navigation.replace('Register')}>
          <Subheading>Register</Subheading>
        </TouchableOpacity> */}
      </Wrapper>
      <TextView marginTop={50}>
        <Heading>Sign in</Heading>
        <Subheading marginVertical={20}>Welcome To Zwigato</Subheading>
      </TextView>

      <PhoneView flex={1}>
        <BorderView>

          <Text style={{ color: '#808080', position: "absolute", top: -10, left: 12, paddingHorizontal: 6, backgroundColor: 'white', fontFamily: "Montserrat_400Regular" }}>Phone</Text>
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
              onChangeText={(text) => {
                const filteredText = text.replace(/[^0-9]/g, "");
                setPhone(filteredText);
                setError(null);
              }}
              style={{
                fontFamily: "Montserrat_400Regular"
              }}
              mode="outlined" keyboardType={'phone-pad'} maxLength={15} placeholder='Phone' />
          </PhoneInputView>
        </BorderView>
        {error && <ErrorText>{error}</ErrorText>}

        <ButtonViewHeight>
  {loginLoading ? (
    <ActivityIndicator color="#0C8A7B" />
  ) : (
    <Button onPress={handleSubmit} title="Sign in" />
  )}
</ButtonViewHeight>

        {/* <SignupView>

          <Text style={{ fontFamily: "Montserrat_400Regular" }}>Don’t have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace('Register')}>
            <Text style={{ color: 'orange', fontFamily: "Montserrat_400Regular" }}> Sign up </Text>
          </TouchableOpacity>
        </SignupView> */}
      </PhoneView>

      <Snackbar
        visible={show}
        onDismiss={() => setShow(false)}
      >
        {apiError}
      </Snackbar>
      </>
      )}
      <CheckLocation/>

      <StatusBar style="light" />



    </Main>
  )
}