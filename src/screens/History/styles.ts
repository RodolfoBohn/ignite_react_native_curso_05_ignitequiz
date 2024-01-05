import { StyleSheet } from 'react-native';

import { THEME } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.COLORS.GREY_800,
  },
  history: {
    flexGrow: 1,
    padding: 32,
  }, 
  swipableContainer: {
    backgroundColor: THEME.COLORS.DANGER_LIGHT, 
    borderRadius: 6,
    height: 90,
    marginBottom: 12, 
    width: '100%'
  }, 
  swipableRemove: {
    height: 90,
    width: 90, 
    backgroundColor: THEME.COLORS.DANGER_LIGHT, 
    borderRadius: 6,
    alignItems: 'center', 
    justifyContent:  'center'
  }
});