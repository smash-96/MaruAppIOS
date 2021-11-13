import React, {useState} from 'react';
import {Image, Text, View, TextInput, Alert, Keyboard} from 'react-native';
import Authentication_Button from '../../Custom/AuthenticationButton';
import {SocialIcon} from 'react-native-elements';
import {Container, Content} from 'native-base';
import dynamic_styles from './SignupStyles';
import {Formik} from 'formik';
import * as yup from 'yup';
import {auth, db} from '../../../firebase/firebaseConfig';
import firestore from '@react-native-firebase/firestore';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import I18n from '../../../localization/utils/language';
import authManager from '../../Utils/AuthManager';
import {useDispatch} from 'react-redux';
import {
  setUserFname,
  setUserLname,
  setUserEmail,
} from '../../../slices/userInfoSlice';
import TNActivityIndicator from '../../Custom/TNActivityIndicator/TNActivityIndicator';
import {TouchableOpacity} from 'react-native-gesture-handler';

const signupSchema = yup.object({
  fname: yup.string().required('First Name cannot be empty'),
  lname: yup.string().required('Last Name cannot be empty'),
  email: yup
    .string()
    .required('Email cannot be empty')
    .matches(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Email not valid',
    ),
  pass: yup.string().required('Password cannot be empty').min(8),
});

const Signup = props => {
  const styles = dynamic_styles();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const signup = async (values, actions) => {
    console.log('Signup');
    setLoading(true);
    auth
      .createUserWithEmailAndPassword(values.email, values.pass)
      .then(authUser => {
        console.log('User account created & signed in!');
        authUser.user.updateProfile({
          displayName: values.fname,
          //photoURL: photoUrl,
        });
        authUser.user.sendEmailVerification();
        db.collection('Users')
          .doc(authUser.user.uid)
          .set({
            uid: authUser.user.uid,
            email: values.email,
            password: values.pass,
            fname: values.fname,
            lname: values.lname,
            helpRequestID: 'null',
            //createdAt: firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            console.log('User added!');

            //Alert.alert("User added!", "User account created & signed in!");
            //props.navigation.replace("Home");
          });

        authManager.handleSuccessfulSignup(authUser.user, true).then(res => {
          if (res?.user) {
            //const user = res.user;
            dispatch(setUserFname(values.fname));
            dispatch(setUserLname(values.lname));
            dispatch(setUserEmail(values.email));

            Keyboard.dismiss();
            props.navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'MapStack',
                  //params: { user: authUser.user }
                },
              ],
            });
          } else {
            setLoading(false);

            if (res.verification) {
              Alert.alert(
                I18n.t('signup.alert.header'),
                I18n.t('signup.alert.body'),
                [I18n.t('signup.alert.button')],
                {
                  cancelable: false,
                },
              );
              props.navigation.goBack();
            } else {
              Alert.alert(
                '',
                I18n.t('signup.alert.error'),
                [I18n.t('signup.alert.button')],
                {
                  cancelable: false,
                },
              );
            }
          }
        });
      })
      .catch(error => {
        setLoading(false);
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
        } else if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
        } else {
          console.error('Signup Error', error);
        }
      });
    //actions.resetForm();
  };

  const login = () => {
    props.navigation.goBack();
  };

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      keyboardShouldPersistTaps={'handled'}
      enableResetScrollToCoords={false}>
      <Container>
        <Content
          contentContainerStyle={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}>
          {/* Footer Image */}
          <View style={styles.footerImage}>
            <Image source={require('../../../assets/footLogin.png')} />
          </View>
          {/* Logo at the top  */}
          <Image
            source={require('../../../assets/Logo.png')}
            style={styles.logo}
          />

          <Formik
            initialValues={{fname: '', lname: '', email: '', pass: ''}}
            validationSchema={signupSchema}
            onSubmit={signup}>
            {formikProps => (
              <>
                <TextInput
                  style={styles.txtInput}
                  placeholder={I18n.t('signup.fnamePlaceholder')}
                  placeholderTextColor="#aaaaaa"
                  onChangeText={formikProps.handleChange('fname')}
                  onBlur={formikProps.handleBlur('fname')}
                  value={formikProps.values.fname}
                  keyboardType="default"
                />
                {/* <Text style={styles.error}>
                    {formikProps.touched.fname && formikProps.errors.fname}
                  </Text> */}

                <TextInput
                  style={styles.txtInput}
                  placeholder={I18n.t('signup.lnamePlaceholder')}
                  placeholderTextColor="#aaaaaa"
                  onChangeText={formikProps.handleChange('lname')}
                  onBlur={formikProps.handleBlur('lname')}
                  value={formikProps.values.lname}
                  keyboardType="default"
                />
                {/* <Text style={styles.error}>
                    {formikProps.touched.lname && formikProps.errors.lname}
                  </Text> */}

                <TextInput
                  style={styles.txtInput}
                  placeholder={I18n.t('signup.emailPlaceholder')}
                  placeholderTextColor="#aaaaaa"
                  type="email"
                  onChangeText={formikProps.handleChange('email')}
                  onBlur={formikProps.handleBlur('email')}
                  value={formikProps.values.email}
                  keyboardType="email-address"
                />
                {/* <Text style={styles.error}>
                    {formikProps.touched.email && formikProps.errors.email}
                  </Text> */}

                <TextInput
                  style={styles.txtInput}
                  placeholder={I18n.t('signup.passPlaceholder')}
                  placeholderTextColor="#aaaaaa"
                  type="password"
                  secureTextEntry={true}
                  onChangeText={formikProps.handleChange('pass')}
                  value={formikProps.values.pass}
                />

                {/* <Text style={styles.error}>
                    {formikProps.touched.pass && formikProps.errors.pass}
                  </Text> */}

                <View style={styles.authenticationButton}>
                  <Authentication_Button
                    title={I18n.t('signup.signup')}
                    backGroundColor={'#FFFFFF'}
                    textColor={'#2c88d1'}
                    borderColor={'#2c88d1'}
                    handlePress={formikProps.handleSubmit}
                  />
                </View>
              </>
            )}
          </Formik>
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
              }}>
              {I18n.t('signup.login')}
              <Text
                style={{
                  // fontSize: 16,
                  fontWeight: 'bold',
                  color: 'blue',
                }}
                onPress={login}>
                {' '}
                {I18n.t('signup.eText')}
              </Text>
            </Text>
            {/* <Authentication_Button
              title={I18n.t("signup.login")}
              backGroundColor={"#2c88d1"}
              textColor={"#FFFFFF"}
              borderColor={"#2c88d1"}
              handlePress={login}
            /> */}
          </View>
        </Content>
      </Container>
      {loading && <TNActivityIndicator />}
    </KeyboardAwareScrollView>
  );
};

export default Signup;
