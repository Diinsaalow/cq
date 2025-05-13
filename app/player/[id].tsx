// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   Dimensions,
// } from 'react-native';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import {
//   ArrowLeft,
//   SkipBack,
//   Play,
//   SkipForward,
//   Volume2,
// } from 'lucide-react-native';
// import Colors from '../../constants/Colors';
// import { MOCK_DATA } from '../../data/mockData';

// const { width } = Dimensions.get('window');

// export default function PlayerScreen() {
//   const router = useRouter();
//   const { sectionId, audioIndex } = useLocalSearchParams();

//   // Find the section data
//   const section = MOCK_DATA.flatMap((category) => category.sections).find(
//     (section) => section.id === sectionId
//   );

//   if (!section) {
//     return (
//       <View style={styles.container}>
//         <Text>Section not found</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       {/* <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => router.back()}
//         >
//           <ArrowLeft color={Colors.textDark} size={24} />
//         </TouchableOpacity>
//         <View style={styles.headerText}>
//           <Text style={styles.headerTitle}>Now Playing</Text>
//           <Text style={styles.headerSubtitle}>{section.title}</Text>
//         </View>
//       </View>

//       {/* Album Art */}
//       <View style={styles.albumArtContainer}>
//         <Image source={{ uri: section.imageUrl }} style={styles.albumArt} />
//       </View>

//       {/* Track Info */}
//       <View style={styles.trackInfo}>
//         <Text style={styles.trackTitle}>Audio {Number(audioIndex) + 1}</Text>
//         <Text style={styles.trackSubtitle}>{section.title}</Text>
//       </View>

//       {/* Progress Bar */}
//       <View style={styles.progressContainer}>
//         <View style={styles.progressBar}>
//           <View style={styles.progress} />
//         </View>
//         <View style={styles.timeContainer}>
//           <Text style={styles.timeText}>0:00</Text>
//           <Text style={styles.timeText}>3:45</Text>
//         </View>
//       </View>

//       {/* Controls */}
//       <View style={styles.controls}>
//         <TouchableOpacity style={styles.controlButton}>
//           <SkipBack size={32} color={Colors.textDark} />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.playButton}>
//           <Play size={32} color={Colors.white} />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.controlButton}>
//           <SkipForward size={32} color={Colors.textDark} />
//         </TouchableOpacity>
//       </View>

//       {/* Volume Control */}
//       <View style={styles.volumeContainer}>
//         <Volume2 size={20} color={Colors.textLight} />
//         <View style={styles.volumeBar}>
//           <View style={styles.volumeLevel} />
//         </View>
//       </View> */}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.background,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingTop: 60,
//     paddingBottom: 20,
//   },
//   backButton: {
//     padding: 8,
//     marginRight: 12,
//     borderRadius: 12,
//     backgroundColor: 'rgba(0,0,0,0.05)',
//   },
//   headerText: {
//     flex: 1,
//   },
//   headerTitle: {
//     fontSize: 16,
//     color: Colors.textLight,
//   },
//   headerSubtitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: Colors.textDark,
//   },
//   albumArtContainer: {
//     alignItems: 'center',
//     marginTop: 40,
//     marginBottom: 40,
//   },
//   albumArt: {
//     width: width - 80,
//     height: width - 80,
//     borderRadius: 20,
//   },
//   trackInfo: {
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   trackTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: Colors.textDark,
//     marginBottom: 8,
//   },
//   trackSubtitle: {
//     fontSize: 16,
//     color: Colors.textLight,
//   },
//   progressContainer: {
//     paddingHorizontal: 20,
//     marginBottom: 20,
//   },
//   progressBar: {
//     height: 4,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     borderRadius: 2,
//     marginBottom: 8,
//   },
//   progress: {
//     width: '30%',
//     height: '100%',
//     backgroundColor: Colors.primary,
//     borderRadius: 2,
//   },
//   timeContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   timeText: {
//     fontSize: 12,
//     color: Colors.textLight,
//   },
//   controls: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 40,
//   },
//   controlButton: {
//     padding: 20,
//   },
//   playButton: {
//     backgroundColor: Colors.primary,
//     padding: 24,
//     borderRadius: 40,
//     marginHorizontal: 20,
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   volumeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   volumeBar: {
//     flex: 1,
//     height: 4,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     borderRadius: 2,
//     marginLeft: 12,
//   },
//   volumeLevel: {
//     width: '70%',
//     height: '100%',
//     backgroundColor: Colors.primary,
//     borderRadius: 2,
//   },
// });
