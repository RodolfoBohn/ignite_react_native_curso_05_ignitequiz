import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { styles } from './styles';

import {
  Canvas, 
  Path, 
  BlurMask,
  Skia, 
  useValue,
  runTiming
} from '@shopify/react-native-skia'
import { THEME } from '../../styles/theme';
import { useEffect } from 'react';

type Props = TouchableOpacityProps & {
  checked: boolean;
  title: string;
}

const CHECK_SIZE = 28
const CHECK_STROKE = 2
const CHECK_RADIUS = (CHECK_SIZE-CHECK_STROKE)/2

export function Option({ checked, title, ...rest }: Props) {
  const percentage = useValue(0)

  const path = Skia.Path.Make()

  path.addCircle(CHECK_SIZE, CHECK_SIZE,CHECK_RADIUS)

  useEffect(() => {
    if(checked) {
      runTiming(percentage, 1, {duration: 700})
    } else {
      runTiming(percentage, 0, {duration: 700})
    }
  },[checked])

  return (
    <TouchableOpacity
      style={
        [
          styles.container,
          checked && styles.checked
        ]
      }
      {...rest}
    >
      <Text style={styles.title}>
        {title}
      </Text>

      <Canvas style={{height: CHECK_SIZE * 2, width: CHECK_SIZE * 2}}>
        <Path 
          path={path} 
          color={THEME.COLORS.GREY_500}
          style="stroke"
          strokeWidth={CHECK_STROKE}
        />

        <Path 
          path={path} 
          color={THEME.COLORS.BRAND_LIGHT}
          style="stroke"
          strokeWidth={CHECK_STROKE}
          start={0}
          end={percentage}
        >
          <BlurMask blur={1} style="solid" />
        </Path>
      </Canvas>
    </TouchableOpacity>
  );
}