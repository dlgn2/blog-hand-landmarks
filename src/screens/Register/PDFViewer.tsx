import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PDF from 'react-native-pdf';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const pdfMap: Record<string, any> = {
  cerezPolitikasi: require('../../assets/pdf/CerezPolitikasi.pdf'),
  tslBilgilendirme: require('../../assets/pdf/TSLBilgilendirme.pdf'),
  acikRizaMetni: require('../../assets/pdf/AcikRizaMetni.pdf'),
  hizmetKosullari: require('../../assets/pdf/HizmetKosullari.pdf'),
  gizlilikPolitikasi: require('../../assets/pdf/GizlilikPolitikasi.pdf'),
  aydinlatmaMetni: require('../../assets/pdf/AydinlatmaMetni.pdf'),
};

const PdfViewer = ({ route }: { route: any }) => {
  const { pdfKey } = route.params;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // pdfKey'e göre local PDF dosyamızı alıyoruz.
  const source = pdfMap[pdfKey];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PDF Görüntüleyici</Text>
      </View>

      {/* PDF Viewer */}
      <PDF
        source={source}
        style={styles.pdf}
        onLoadProgress={(percent) => console.log(`Yükleniyor: %${percent}`)}
        onLoadComplete={(pages) => console.log(`Toplam sayfa: ${pages}`)}
        onError={(error) => console.log('PDF yükleme hatası: ', error)}
        renderActivityIndicator={() => (
          <ActivityIndicator size="large" color="#000" />
        )}
      />
    </View>
  );
};

export default PdfViewer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 50,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  pdf: {
    flex: 1,
    width: '100%',
  },
});
