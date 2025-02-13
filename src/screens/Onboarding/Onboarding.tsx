import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import SelectDropdown from 'react-native-select-dropdown';

import { Paths } from '@/navigation/paths';
import { RootScreenProps } from '@/navigation/types';

import { storage } from '@/App'; // Adjust the import path as needed

import { API } from '@/services/implementations/api/API';
import { FetchAdapter } from '@/services/implementations/api/FetchAdapter';
import { UserService } from '@/services/implementations/services/UserService';

const OnboardingComponent: React.FC<RootScreenProps> = ({
  navigation,
  route,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(1);
  const [answers, setAnswers] = useState<any>({});
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);

  const cities = [
    'Adana',
    'Adıyaman',
    'Afyonkarahisar',
    'Ağrı',
    'Amasya',
    'Ankara',
    'Antalya',
    'Artvin',
    'Aydın',
    'Balıkesir',
    'Bilecik',
    'Bingöl',
    'Bitlis',
    'Bolu',
    'Burdur',
    'Bursa',
    'Çanakkale',
    'Çankırı',
    'Çorum',
    'Denizli',
    'Diyarbakır',
    'Edirne',
    'Elazığ',
    'Erzincan',
    'Erzurum',
    'Eskişehir',
    'Gaziantep',
    'Giresun',
    'Gümüşhane',
    'Hakkari',
    'Hatay',
    'Isparta',
    'Mersin',
    'İstanbul',
    'İzmir',
    'Kars',
    'Kastamonu',
    'Kayseri',
    'Kırklareli',
    'Kırşehir',
    'Kocaeli',
    'Konya',
    'Kütahya',
    'Malatya',
    'Manisa',
    'Kahramanmaraş',
    'Mardin',
    'Muğla',
    'Muş',
    'Nevşehir',
    'Niğde',
    'Ordu',
    'Rize',
    'Sakarya',
    'Samsun',
    'Siirt',
    'Sinop',
    'Sivas',
    'Tekirdağ',
    'Tokat',
    'Trabzon',
    'Tunceli',
    'Şanlıurfa',
    'Uşak',
    'Van',
    'Yozgat',
    'Zonguldak',
    'Aksaray',
    'Bayburt',
    'Karaman',
    'Kırıkkale',
    'Batman',
    'Şırnak',
    'Bartın',
    'Ardahan',
    'Iğdır',
    'Yalova',
    'Karabük',
    'Kilis',
    'Osmaniye',
    'Düzce',
  ];

  // Update button disabled state based on current question and answers
  useEffect(() => {
    validateCurrentQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, currentQuestion]);

  useEffect(() => {
    const checkIsOnboardingCompleted = storage.getBoolean(
      'onboardingCompleted'
    );
    // Eğer bu ekran Onboarding değilse, yönlendirme yap
    if (!checkIsOnboardingCompleted && route.name !== Paths.Onboarding) {
      navigation.replace(Paths.Onboarding);
    }
  }, [navigation, route]);

  const handleAnswer = (questionKey: string, value: any) => {
    setAnswers((prev: any) => ({ ...prev, [questionKey]: value }));
  };

  const validateCurrentQuestion = () => {
    let isValid = false;
    switch (currentQuestion) {
      case 1:
        isValid = !!answers.hasHearingImpairment;
        break;
      case 2:
        isValid = !!answers.hearingImpairmentDegree;
        break;
      case 3:
        isValid = !!answers.knowsSignLanguage;
        break;
      case 4:
        if (
          answers.signLanguageSupportNeeds &&
          answers.signLanguageSupportNeeds.length > 0
        ) {
          if (answers.signLanguageSupportNeeds.includes('Diğer')) {
            isValid =
              answers.otherSupportNeeds &&
              answers.otherSupportNeeds.trim() !== '';
          } else {
            isValid = true;
          }
        }
        break;
      case 5:
        isValid = !!answers.dateOfBirth;
        break;
      case 6:
        isValid = !!answers.gender;
        break;
      case 7:
        isValid = !!answers.educationLevel;
        break;
      case 8:
        isValid = !!answers.profession;
        break;
      case 9:
        isValid = !!answers.city;
        break;
      case 10:
        isValid = !!answers.incomeLevel;
        break;
      case 11:
        isValid = !!answers.signLanguageFrequency;
        break;
      case 12:
        isValid = !!answers.signLanguageLevel;
        break;
      default:
        isValid = false;
    }
    setIsButtonDisabled((prevDisabled) => {
      const newDisabled = !isValid;
      return prevDisabled !== newDisabled ? newDisabled : prevDisabled;
    });
  };

  const handleNext = async () => {
    if (currentQuestion === 1) {
      if (answers.hasHearingImpairment === 'Evet') {
        setCurrentQuestion(2);
      } else {
        setCurrentQuestion(3);
      }
    } else if (currentQuestion === 2) {
      setCurrentQuestion(3);
    } else if (currentQuestion === 3) {
      if (answers.hasHearingImpairment === 'Evet') {
        if (answers.knowsSignLanguage === 'Evet') {
          setCurrentQuestion(4);
        } else {
          setCurrentQuestion(5); // Proceed to demographic questions
        }
      } else {
        if (answers.knowsSignLanguage === 'Evet') {
          setCurrentQuestion(12);
        } else {
          setCurrentQuestion(5);
        }
      }
    } else if (currentQuestion === 4) {
      setCurrentQuestion(5);
    } else if (currentQuestion === 12) {
      setCurrentQuestion(11);
    } else if (currentQuestion === 11) {
      setCurrentQuestion(5);
    } else if (currentQuestion >= 5 && currentQuestion <= 9) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentQuestion === 10) {
      try {
        // Calculate age from dateOfBirth
        let age: number | undefined;
        if (answers.dateOfBirth) {
          const today = new Date();
          const birthDate = new Date(answers.dateOfBirth);
          age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }

        // Map answers to UserService's createDemographic parameters
        const demographicData = {
          age: age || null,
          gender: answers.gender || null,
          education_level: answers.educationLevel || null,
          job: answers.profession || null,
          income_level: answers.incomeLevel || null,
          city: answers.city || null,
          is_hearing_impaired:
            answers.hasHearingImpairment === 'Evet' ? true : false,
          is_know_tsl: answers.knowsSignLanguage === 'Evet' ? true : false,
          usage_frequency_tsl: answers.signLanguageFrequency || null,
          tsl_comments:
            answers.signLanguageSupportNeeds &&
            answers.signLanguageSupportNeeds.includes('Diğer')
              ? answers.otherSupportNeeds || null
              : null,
          tsl_level: answers.signLanguageLevel || null,
        };

        const api = new API();
        // Call the API
        console.log(
          'first',
          demographicData.age,
          demographicData.gender,
          demographicData.education_level,
          demographicData.job,
          demographicData.income_level,
          demographicData.city,
          demographicData.is_hearing_impaired,
          demographicData.is_know_tsl,
          demographicData.usage_frequency_tsl,
          demographicData.tsl_comments,
          demographicData.tsl_level
        );
        await api.user.createDemographic(
          demographicData.age,
          'name',
          demographicData.gender,
          demographicData.education_level,
          demographicData.job,
          demographicData.income_level,
          demographicData.city,
          demographicData.is_hearing_impaired,
          demographicData.is_know_tsl,
          demographicData.usage_frequency_tsl,
          demographicData.tsl_comments,
          demographicData.tsl_level
        );

        // Navigate to Home after successful API call
        storage.set('onboardingCompleted', true);
        navigation.replace(Paths.Home);
      } catch (error: any) {
        Alert.alert(
          'Hata',
          error.message || 'Demografik veriler kaydedilemedi.'
        );
      }
    }
    setIsButtonDisabled(true);
  };

  const renderQuestion = () => {
    switch (currentQuestion) {
      case 1:
        return renderQuestion1();
      case 2:
        return renderQuestion2();
      case 3:
        return renderQuestion3();
      case 4:
        return renderQuestion4();
      case 5:
        return renderDateOfBirth();
      case 6:
        return renderGender();
      case 7:
        return renderEducationLevel();
      case 8:
        return renderProfession();
      case 9:
        return renderCity();
      case 10:
        return renderIncomeLevel();
      case 11:
        return renderSignLanguageFrequency();
      case 12:
        return renderSignLanguageLevel();
      case 13:
        return renderFinish();
      default:
        return null;
    }
  };

  const renderQuestion1 = () => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 16, marginBottom: 8, color: '#000' }}>
        Herhangi bir işitme engeliniz var mı?
      </Text>
      <View style={{ justifyContent: 'space-around' }}>
        {['Evet', 'Hayır'].map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => handleAnswer('hasHearingImpairment', option)}
            style={{
              backgroundColor:
                answers.hasHearingImpairment === option ? '#943C8B' : 'gray',
              borderRadius: 8,
              padding: 16,
              marginVertical: 8,
            }}
          >
            <Text style={{ color: 'white' }}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderQuestion2 = () => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 16, marginBottom: 8, color: '#000' }}>
        İşitme engelinizin derecesi nedir?
      </Text>
      {['Çok Hafif', 'Orta Derece', 'İleri derece', 'Çok ileri derece'].map(
        (option) => (
          <TouchableOpacity
            key={option}
            onPress={() => handleAnswer('hearingImpairmentDegree', option)}
            style={{
              backgroundColor:
                answers.hearingImpairmentDegree === option ? '#943C8B' : 'gray',
              borderRadius: 8,
              padding: 16,
              marginVertical: 8,
            }}
          >
            <Text style={{ color: 'white' }}>{option}</Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );

  const renderQuestion3 = () => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 16, marginBottom: 8, color: '#000' }}>
        Türk işaret dili biliyor musunuz?
      </Text>
      <View style={{ justifyContent: 'space-around' }}>
        {['Evet', 'Hayır'].map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => handleAnswer('knowsSignLanguage', option)}
            style={{
              backgroundColor:
                answers.knowsSignLanguage === option ? '#943C8B' : 'gray',
              borderRadius: 8,
              padding: 16,
              marginVertical: 8,
            }}
          >
            <Text style={{ color: 'white' }}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderQuestion4 = () => {
    const options = [
      'Ev',
      'Market',
      'Okul',
      'Hastane',
      'Eczane',
      'Banka',
      'Diğer',
    ];

    const toggleOption = (option: string) => {
      let selectedOptions = answers.signLanguageSupportNeeds || [];
      if (selectedOptions.includes(option)) {
        selectedOptions = selectedOptions.filter((o: string) => o !== option);
        if (option === 'Diğer') {
          setAnswers((prev: any) => ({ ...prev, otherSupportNeeds: '' }));
        }
      } else {
        selectedOptions.push(option);
      }
      setAnswers((prev: any) => ({
        ...prev,
        signLanguageSupportNeeds: selectedOptions,
      }));
    };

    return (
      <SafeAreaView>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 16, marginBottom: 8, color: '#000' }}>
            Türk işaret dili kullanımı konusunda günlük hayatınızda en çok hangi
            konularda desteğe ihtiyaç duyuyorsunuz? (Birden fazla seçeneği
            işaretleyebilirsiniz)
          </Text>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => toggleOption(option)}
              style={{
                backgroundColor:
                  answers.signLanguageSupportNeeds &&
                  answers.signLanguageSupportNeeds.includes(option)
                    ? '#943C8B'
                    : 'gray',

                borderRadius: 8,
                padding: 16,
                marginVertical: 6,
              }}
            >
              <Text style={{ color: 'white' }}>{option}</Text>
            </TouchableOpacity>
          ))}
          {answers.signLanguageSupportNeeds &&
            answers.signLanguageSupportNeeds.includes('Diğer') && (
              <TextInput
                placeholder="Lütfen belirtiniz"
                placeholderTextColor={'black'}
                value={answers.otherSupportNeeds}
                onChangeText={(text) => {
                  handleAnswer('otherSupportNeeds', text);
                }}
                style={{
                  borderColor: 'gray',
                  borderWidth: 1,
                  marginTop: 8,
                  padding: 8,
                  borderRadius: 8,
                }}
              />
            )}
        </View>
      </SafeAreaView>
    );
  };

  const newDate = new Date();
  const minYear = newDate.getFullYear() - 8;
  newDate.setFullYear(minYear);
  const renderDateOfBirth = () => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 16, marginBottom: 8, color: '#000' }}>
        Doğum tarihiniz
      </Text>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{
          borderColor: 'gray',
          borderWidth: 1,
          padding: 16,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            color: '#000',
          }}
        >
          {answers.dateOfBirth
            ? new Date(answers.dateOfBirth).toLocaleDateString('tr-TR')
            : 'Tarih Seçiniz'}
        </Text>
      </TouchableOpacity>

      <DatePicker
        modal
        open={open}
        minimumDate={new Date(1920, 0, 1)}
        maximumDate={newDate}
        date={answers.dateOfBirth ? new Date(answers.dateOfBirth) : new Date()}
        onConfirm={(date) => {
          setOpen(false);
          handleAnswer('dateOfBirth', date.toISOString());
        }}
        onCancel={() => {
          setOpen(false);
        }}
        locale="tr"
        mode="date"
      />
    </View>
  );

  const renderGender = () => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 16, marginBottom: 8, color: '#000' }}>
        Cinsiyetiniz
      </Text>
      {['Erkek', 'Kadın', 'Diğer'].map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => handleAnswer('gender', option)}
          style={{
            backgroundColor: answers.gender === option ? '#943C8B' : 'gray',
            borderRadius: 8,
            padding: 16,
            marginVertical: 8,
          }}
        >
          <Text style={{ color: 'white' }}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEducationLevel = () => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 16, marginBottom: 8, color: '#000' }}>
        Eğitim durumunuz (Son mezun olunan düzeye göre)
      </Text>
      {[
        'İlkokul',
        'Ortaokul',
        'Lise',
        'Üniversite (Lisans)',
        'Üniversite (Yüksek Lisans)',
        'Üniversite (Doktora)',
      ].map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => handleAnswer('educationLevel', option)}
          style={{
            backgroundColor:
              answers.educationLevel === option ? '#943C8B' : 'gray',
            borderRadius: 8,
            padding: 16,
            marginVertical: 8,
          }}
        >
          <Text style={{ color: 'white' }}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderProfession = () => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 16, marginBottom: 8, color: '#000' }}>
        Mesleğiniz
      </Text>
      <TextInput
        placeholder="Mesleğinizi giriniz"
        placeholderTextColor={'black'}
        value={answers.profession}
        onChangeText={(text) => {
          handleAnswer('profession', text);
        }}
        style={{
          borderColor: 'gray',
          borderWidth: 1,
          padding: 8,
          borderRadius: 8,
          color: '#000',
        }}
      />
    </View>
  );

  const renderCity = () => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 16, marginBottom: 8, color: '#000' }}>
        Yaşadığınız il
      </Text>
      <SelectDropdown
        data={cities}
        onSelect={(selectedItem) => {
          handleAnswer('city', selectedItem);
        }}
        renderButton={(selectedItem) => (
          <View
            style={{
              borderColor: 'gray',
              borderWidth: 1,
              padding: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#000' }}>
              {selectedItem || 'Şehir Seçiniz'}
            </Text>
          </View>
        )}
        renderItem={(item, index) => (
          <View style={{ padding: 16 }}>
            <Text style={{ color: '#000' }}>{item}</Text>
          </View>
        )}
      />
    </View>
  );

  const renderIncomeLevel = () => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 16, marginBottom: 8, color: '#000' }}>
        Gelir düzeyiniz
      </Text>
      {[
        'Düşük sosyo-ekonomik düzey',
        'Orta sosyo-ekonomik düzey',
        'Yüksek sosyo-ekonomik düzey',
        'Belirtmek istemiyorum',
      ].map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => handleAnswer('incomeLevel', option)}
          style={{
            backgroundColor:
              answers.incomeLevel === option ? '#943C8B' : 'gray',
            borderRadius: 8,
            padding: 16,
            marginVertical: 8,
          }}
        >
          <Text style={{ color: 'white' }}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSignLanguageFrequency = () => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 16, marginBottom: 8, color: '#000' }}>
        Günlük hayatınızda (markette, okulda vb.) ne sıklıkla Türk işaret dilini
        kullanıyorsunuz?
      </Text>
      {['Hiçbir zaman', 'Nadiren', 'Ara sıra', 'Sık sık', 'Her zaman'].map(
        (option) => (
          <TouchableOpacity
            key={option}
            onPress={() => handleAnswer('signLanguageFrequency', option)}
            style={{
              backgroundColor:
                answers.signLanguageFrequency === option ? '#943C8B' : 'gray',
              borderRadius: 8,
              padding: 16,
              marginVertical: 8,
            }}
          >
            <Text style={{ color: 'white' }}>{option}</Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );

  const renderSignLanguageLevel = () => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 16, marginBottom: 8, color: '#000' }}>
        Seviyeniz nedir? (A1, A2 gibi)
      </Text>
      {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => handleAnswer('signLanguageLevel', option)}
          style={{
            backgroundColor:
              answers.signLanguageLevel === option ? '#943C8B' : 'gray',
            borderRadius: 8,
            padding: 16,
            marginVertical: 8,
          }}
        >
          <Text style={{ color: 'white' }}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFinish = () => (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Teşekkür ederiz!</Text>
    </View>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F0F3FB',
      }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View>{renderQuestion()}</View>
          {currentQuestion < 13 && (
            <View>
              <TouchableOpacity
                disabled={isButtonDisabled}
                onPress={handleNext}
                style={{
                  backgroundColor: isButtonDisabled ? 'gray' : '#943C8B',
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  margin: 16,
                }}
              >
                <Text style={{ color: 'white' }}>Devam Et</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OnboardingComponent;
