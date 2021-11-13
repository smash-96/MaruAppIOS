import {StyleSheet} from 'react-native';

const dynamic_styles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#effdfe',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2%',
    },
    logo: {
      width: 150,
      height: 150,
      resizeMode: 'cover',
    },
    txtInput: {
      marginBottom: 10,
      marginTop: 10,
      borderRadius: 12,
      borderWidth: 1.4,
      width: '85%',
      paddingVertical: 14,
      backgroundColor: '#ffffff',
      color: '#000000',
      fontSize: 19,
      paddingLeft: '5%',
    },

    authenticationButton: {
      marginTop: 10,
      marginBottom: 10,
      width: '85%',
    },
    footerImage: {
      marginTop: '5%',
      position: 'absolute', //Here is the trick
      bottom: 0, //Here is the trick
    },
  });
};

export default dynamic_styles;
