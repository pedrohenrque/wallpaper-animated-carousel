import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native'

import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Text } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated'
import { Photo, SearchPayload, SlideProps } from './types'

const uri = `https://api.pexels.com/v1/search?query=sao paulo&orientation=portrait`

const { width, height } = Dimensions.get('window')
const _slideWidth = width * 0.75
const _slideHeight = _slideWidth * 1.76
const _spacing = 18
const _topSpacing = height - _slideHeight

function Slide({ photo, index, scrollX }: SlideProps) {
  const containerStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollX.value,
            [index - 1, index, index + 1],
            [40, 0, 40],
            Extrapolation.CLAMP
          )
        }
      ]
    }
  })

  const styles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotateZ: `${interpolate(
            scrollX.value,
            [index - 1, index, index + 1],
            [15, 0, -15],
            Extrapolation.CLAMP
          )}deg`
        },
        {
          scale: interpolate(
            scrollX.value,
            [index - 1, index, index + 1],
            [1.6, 1, 1.6],
            Extrapolation.CLAMP
          )
        }
      ]
    }
  })

  return (
    <Animated.View
      style={[
        {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 0
          },
          shadowOpacity: 0.6,
          shadowRadius: 20,
          elevation: 7,
          borderRadius: 12
        },
        containerStyles
      ]}
    >
      <View
        style={{
          width: _slideWidth,
          height: _slideHeight,
          borderRadius: 12,
          overflow: 'hidden',
          padding: 2,
          backgroundColor: 'rgba(0,0,0,0.1)'
        }}
      >
        <Animated.Image
          source={{ uri: photo.src.large }}
          style={[{ flex: 1, borderRadius: 12 }, styles]}
        />
      </View>
    </Animated.View>
  )
}

function BackdropImage({ photo, index, scrollX }: SlideProps) {
  const styles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollX.value,
        [index - 1, index, index + 1],
        [0, 0.8, 0]
      )
    }
  })
  return (
    <Animated.Image
      source={{ uri: photo.src.large }}
      style={[StyleSheet.absoluteFillObject, styles]}
      blurRadius={50}
    />
  )
}

function AuthorDetails({ photo, index, scrollX }: SlideProps) {
  const styles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            scrollX.value,
            [index - 1, index, index + 1],
            [width / 2, 0, -width / 2]
          )
        }
      ],
      opacity: interpolate(
        scrollX.value,
        [index - 0.5, index, index + 0.5],
        [0, 1, 0]
      )
    }
  })
  return (
    <Animated.View
      style={[
        {
          gap: 4,
          position: 'absolute',
          height: '30%',
          width: '100%',
          alignItems: 'center',
          paddingHorizontal: width * 0.1
        },
        styles
      ]}
    >
      <Text
        style={{
          fontSize: 18,
          color: 'white',
          fontWeight: '700',
          textTransform: 'capitalize'
        }}
      >
        {photo.photographer}
      </Text>
      <Text style={{ color: '#fff', opacity: 0.5, textAlign: 'center' }}>
        {photo.alt}
      </Text>
    </Animated.View>
  )
}

export function Dashboard() {
  const { data, isLoading } = useQuery<Photo[]>({
    queryKey: ['wallpapers', 'collection'],
    queryFn: async () => {
      const res = await fetch(uri, {
        headers: {
          Authorization: process.env.EXPO_PUBLIC_PEXELS_API_KEY
        }
      }).then((x) => x.json() as unknown as SearchPayload)

      return res.photos
    }
  })

  const scrollX = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x / (_slideWidth + _spacing)
  })

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size={'large'} />
      </View>
    )
  }

  return (
    <View
      style={{ flex: 1, justifyContent: 'center', backgroundColor: '#000' }}
    >
      <View style={StyleSheet.absoluteFillObject}>
        {data?.map((photo, index) => (
          <BackdropImage
            key={`bg-photo-${photo.id}`}
            index={index}
            photo={photo}
            scrollX={scrollX}
          />
        ))}
      </View>
      <View
        style={{
          height: _topSpacing,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {data?.map((photo, index) => (
          <AuthorDetails
            key={`author-details-${photo.id}`}
            index={index}
            photo={photo}
            scrollX={scrollX}
          />
        ))}
      </View>
      <Animated.FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        style={{ opacity: 1, marginTop: -_topSpacing }}
        contentContainerStyle={{
          gap: _spacing,
          paddingHorizontal: (width - _slideWidth) / 2,
          alignItems: 'center',
          paddingTop: _topSpacing
        }}
        renderItem={({ item, index }) => {
          return <Slide index={index} photo={item} scrollX={scrollX} />
        }}
        snapToInterval={_slideWidth + _spacing}
        decelerationRate={'fast'}
        showsHorizontalScrollIndicator={false}
        horizontal
        onScroll={onScroll}
        scrollEventThrottle={1000 / 60} // 16.6ms
      />
    </View>
  )
}
