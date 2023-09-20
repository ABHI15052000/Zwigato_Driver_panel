import { View, Text } from 'react-native'
import React from 'react'
import Lottie from 'lottie-react-native'

const OrderCompleteLottie = () => {
  return (
    <View flex={1} >
      <Lottie
        source={require('../../assets/Lottie/complete.json')}
        loop={false}
        autoPlay
        style={{ width: "80%", height: "90%", alignSelf: 'center' }}
      />
    </View>
  )
}

export default OrderCompleteLottie