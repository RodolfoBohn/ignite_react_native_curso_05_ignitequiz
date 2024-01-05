import { useEffect, useState, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, ScrollView, Alert, Pressable } from 'react-native';
import { HouseLine, Trash } from 'phosphor-react-native';

import { Header } from '../../components/Header';
import { HistoryCard, HistoryProps } from '../../components/HistoryCard';

import { styles } from './styles';
import { historyGetAll, historyRemove } from '../../storage/quizHistoryStorage';
import { Loading } from '../../components/Loading';
import Animated, { Layout, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { THEME } from '../../styles/theme';

export function History() {
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryProps[]>([]);
  const swipableRef = useRef<Swipeable[]>([])

  const { goBack } = useNavigation();

  async function fetchHistory() {
    const response = await historyGetAll();
    setHistory(response);
    setIsLoading(false);
  }

  async function remove(id: string) {
    await historyRemove(id);

    fetchHistory();
  }

  function handleRemove(id: string, index: number) {
    swipableRef.current?.[index]?.close()
    Alert.alert(
      'Remover',
      'Deseja remover esse registro?',
      [
        {
          text: 'Sim', onPress: () => remove(id)
        },
        { text: 'Não', style: 'cancel' }
      ]
    );

  }

  useEffect(() => {
    fetchHistory();
  }, []);

  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <Header
        title="Histórico"
        subtitle={`Seu histórico de estudos${'\n'}realizados`}
        icon={HouseLine}
        onPress={goBack}
      />

      <ScrollView
        contentContainerStyle={styles.history}
        showsVerticalScrollIndicator={false}
      >
        {
          history.map((item, index) => (
            <Animated.View  
              key={item.id}
              entering={SlideInRight}
              exiting={SlideOutLeft}
              layout={Layout.springify()}
            >
              {
                /*
                Exemplo com o usuário arrastando para o lado e clicando
                 <Swipeable
                ref={(ref) => {
                  if(ref) {
                    swipableRef.current.push(ref)
                  }
                }}
                overshootLeft={false}
                containerStyle={styles.swipableContainer}
                renderLeftActions={() => (
                  <Pressable 
                    style={styles.swipableRemove}
                    onPress={() => handleRemove(item.id, index)}
                  >
                    <Trash size={32} color={THEME.COLORS.GREY_100} />
                  </Pressable>
                )}
              > 
                <HistoryCard data={item} />
              </Swipeable>
                */
              }

              {/*Exemplo com o usuário só arrastando para o lado e já disparando a action*/}
              <Swipeable
                ref={(ref) => {
                  if(ref) {
                    swipableRef.current.push(ref)
                  }
                }}
                overshootLeft={false}
                containerStyle={styles.swipableContainer}
                /*Faz com que, se o user mover "10px", já dispare a action*/
                leftThreshold={10}
                onSwipeableOpen={() => handleRemove(item.id, index)}
                renderLeftActions={() => (
                  <View 
                    style={styles.swipableRemove}
                  >
                    <Trash size={32} color={THEME.COLORS.GREY_100} />
                  </View>
                )}
                renderRightActions={() => null}
              > 
                <HistoryCard data={item} />
              </Swipeable>
            </Animated.View>
          ))
        }
      </ScrollView>
    </View>
  );
}