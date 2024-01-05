import { center } from "@shopify/react-native-skia";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    justifyContent: 'center', 
    alignItems: 'center'
  }, 
  canvas: {
    width: 257, 
    height: 249, 
    position: 'absolute', 
    zIndex: 1
  }
})