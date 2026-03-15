import { useState, useCallback } from 'react';
import { StyleSheet, View, Text, PanResponder, TouchableOpacity } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';

interface BeforeAfterProps {
  beforeUri: string;
  afterUri: string;
}

export function BeforeAfter({ beforeUri, afterUri }: BeforeAfterProps) {
  const [sliderPosition, setSliderPosition] = useState(0.5);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const beforePlayer = useVideoPlayer(beforeUri, (player) => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  const afterPlayer = useVideoPlayer(afterUri, (player) => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      beforePlayer.pause();
      afterPlayer.pause();
    } else {
      beforePlayer.play();
      afterPlayer.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, beforePlayer, afterPlayer]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (containerWidth > 0) {
        const newPos = Math.max(0, Math.min(1, (gestureState.moveX) / containerWidth));
        setSliderPosition(newPos);
      }
    },
  });

  return (
    <View
      style={styles.container}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      {...panResponder.panHandlers}
    >
      {/* After (full background) */}
      <VideoView
        player={afterPlayer}
        style={styles.video}
        nativeControls={false}
        contentFit="cover"
      />

      {/* Before (clipped by slider) */}
      <View style={[styles.beforeClip, { width: `${sliderPosition * 100}%` }]}>
        <VideoView
          player={beforePlayer}
          style={[styles.video, { width: containerWidth || 300 }]}
          nativeControls={false}
          contentFit="cover"
        />
      </View>

      {/* Slider line */}
      <View style={[styles.sliderLine, { left: `${sliderPosition * 100}%` }]}>
        <View style={styles.sliderHandle}>
          <Text style={styles.sliderArrows}>◀ ▶</Text>
        </View>
      </View>

      {/* Labels */}
      <View style={styles.labelBefore}>
        <Text style={styles.labelText}>Before</Text>
      </View>
      <View style={styles.labelAfter}>
        <Text style={styles.labelText}>After</Text>
      </View>

      {/* Play/Pause button */}
      <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlayback}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  beforeClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  sliderLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#fff',
    marginLeft: -1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  sliderHandle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderArrows: {
    fontSize: 10,
    color: '#333',
    fontWeight: '700',
  },
  labelBefore: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  labelAfter: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  labelText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  playPauseBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
