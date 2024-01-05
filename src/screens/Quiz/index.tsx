import { useEffect, useState } from 'react';
import { Alert, Text, View, BackHandler } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';

import * as Haptics from 'expo-haptics'

import { styles } from './styles';

import { QUIZ } from '../../data/quiz';
import { historyAdd } from '../../storage/quizHistoryStorage';

import { Loading } from '../../components/Loading';
import { Question } from '../../components/Question';
import { QuizHeader } from '../../components/QuizHeader';
import { ConfirmButton } from '../../components/ConfirmButton';
import { OutlineButton } from '../../components/OutlineButton';

import {Audio} from 'expo-av'

import Animated, {
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSequence, 
  interpolate,
  Easing,
  useAnimatedScrollHandler,
  Extrapolate, 
  runOnJS
} from 'react-native-reanimated';

import {GestureDetector, Gesture} from 'react-native-gesture-handler'

import { THEME } from '../../styles/theme';
import { ProgressBar } from '../../components/ProgressBar';
import { OverlayFeedback } from '../../components/OverlayFeedback';

interface Params {
  id: string;
}

type QuizProps = typeof QUIZ[0];

const CARD_SKIP_AREA = -200

export function Quiz() {
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quiz, setQuiz] = useState<QuizProps>({} as QuizProps);
  const [alternativeSelected, setAlternativeSelected] = useState<null | number>(null);
  const [quizStatus, setQuizStatus] = useState(0)
  const shake = useSharedValue(0)
  const offsetY = useSharedValue(0)
  const cardPosition = useSharedValue(0)

  const { navigate } = useNavigation();

  const route = useRoute();
  const { id } = route.params as Params;

  function handleSkipConfirm() {
    Alert.alert('Pular', 'Deseja realmente pular a questão?', [
      { text: 'Sim', onPress: () => handleNextQuestion() },
      { text: 'Não', onPress: () => { } }
    ]);
  }

  async function handleFinished() {
    await historyAdd({
      id: new Date().getTime().toString(),
      title: quiz.title,
      level: quiz.level,
      points,
      questions: quiz.questions.length
    });

    navigate('finish', {
      points: String(points),
      total: String(quiz.questions.length),
    });
  }

  function handleNextQuestion() {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prevState => prevState + 1)
    } else {
      handleFinished();
    }
  }
  
  async function playAudio(isCorrect:boolean) {
    const file = isCorrect ? require('../../assets/correct.mp3') : require('../../assets/wrong.mp3')

    const sound = await Audio.Sound.createAsync(file)

    await sound.sound.setPositionAsync(0)
    await sound.sound.playAsync()
  }

  async function handleConfirm() {
    if (alternativeSelected === null) {
      return handleSkipConfirm();
    }

    if (quiz.questions[currentQuestion].correct === alternativeSelected) {
      setPoints(prevState => prevState + 1);

      await playAudio(true)
      setQuizStatus(1)
      handleNextQuestion()
    } else {
      await playAudio(false)
      setQuizStatus(2)
      await shakeAnimation()
    }

    setAlternativeSelected(null);
  }

  function handleStop() {
    Alert.alert('Parar', 'Deseja parar agora?', [
      {
        text: 'Não',
        style: 'cancel',
      },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: () => navigate('home')
      },
    ]);

    return true;
  }

  async function shakeAnimation() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    shake.value = withSequence(
      withTiming(3, {duration: 700, easing: Easing.bounce}), 
      withTiming(0, undefined, (finished) => {
        'worklet'
        if(finished) {
          runOnJS(handleNextQuestion)()
        }
      })
    )
  }

  const handlePan = Gesture
    .Pan()
    .activateAfterLongPress(200)
    .onUpdate(event => {
      if(event.translationX < 0) {
        cardPosition.value = event.translationX
      }
    })
    .onEnd((event) => {
      if(event.translationX < CARD_SKIP_AREA) {
        runOnJS(handleSkipConfirm)()
      }
      cardPosition.value = withTiming(0)
    })

  const shakeAnimationStyle = useAnimatedStyle(() => {
    return {
      transform: [{
        translateX: interpolate(
          shake.value, 
          [0, 0.5, 1, 1.5, 2, 2.5, 3],
          [0, -15, 0, 15, 0, -15, 0]
        )
      }]
    }
  })

  const fixedProgessBarStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute', 
      zIndex: 10,
      paddingTop: 50,
      backgroundColor: THEME.COLORS.GREY_500,
      width: '110%', 
      left: '-5%',
      opacity: interpolate(offsetY.value, [30,90], [0,1], Extrapolate.CLAMP), 
      transform: [
        {translateY: interpolate(offsetY.value, [30,90], [-40,0], Extrapolate.CLAMP)}
      ]
    }
  })

  const headerStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(offsetY.value, [40,90], [1,0], Extrapolate.CLAMP), 

    }
  })

  const dragStyles = useAnimatedStyle(() => {
    const rotateZFactor = cardPosition.value / 10
    
    return {
      transform: [
        {translateX: cardPosition.value}, 
        {rotateZ: `${rotateZFactor}deg`}
      ]
    }
  })

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      offsetY.value = event.contentOffset.y
    }
  })

  useEffect(() => {
    const quizSelected = QUIZ.filter(item => item.id === id)[0];
    setQuiz(quizSelected);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleStop)

    return () => backHandler.remove()
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <OverlayFeedback status={quizStatus} />
      <Animated.View style={fixedProgessBarStyle}>
        <Text style={styles.title}>
          {quiz.title}
        </Text>
        <ProgressBar current={currentQuestion + 1} total={quiz.questions.length} />
      </Animated.View>


      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.question}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.header, headerStyles]}>
          <QuizHeader
            title={quiz.title}
            currentQuestion={currentQuestion + 1}
            totalOfQuestions={quiz.questions.length}
          />
        </Animated.View>

        <GestureDetector gesture={handlePan}>
          <Animated.View style={[shakeAnimationStyle, dragStyles]}>
            <Question
              key={quiz.questions[currentQuestion].title}
              question={quiz.questions[currentQuestion]}
              alternativeSelected={alternativeSelected}
              setAlternativeSelected={setAlternativeSelected}
              onUnmount={() => setQuizStatus(0)}
            />
          </Animated.View>
        </GestureDetector>
        <View style={styles.footer}>
          <OutlineButton title="Parar" onPress={handleStop} />
          <ConfirmButton onPress={handleConfirm} />
        </View>
      </Animated.ScrollView>
    </View >
  );
}