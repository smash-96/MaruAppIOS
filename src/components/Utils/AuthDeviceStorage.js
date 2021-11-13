import AsyncStorage from "@react-native-async-storage/async-storage";
const SHOULD_SHOW_ONBOARDING_FLOW = "SHOULD_SHOW_ONBOARDING_FLOW";

/**
 * Get Should Show Onboarding
 * @param {String} value
 * @returns {Boolean}
 */
const getShouldShowOnboardingFlow = async () => {
  try {
    const result = await AsyncStorage.getItem(SHOULD_SHOW_ONBOARDING_FLOW);

    return result !== null ? false : true;
  } catch (err) {
    console.log(err);
  }
};
const getAppLanguage = async () => {
  try {
    const result = await AsyncStorage.getItem("language");

    return result;
  } catch (err) {
    console.log(err);
  }
};

const getFirstSignup = async () => {
  try {
    const result = await AsyncStorage.getItem("first_signup");

    return result;
  } catch (err) {
    console.log(err);
  }
};

/**
 * Get Should Show OnBoarding Flow
 * @param {String} value
 *
 */
const setShouldShowOnboardingFlow = async (value) => {
  try {
    await AsyncStorage.setItem(SHOULD_SHOW_ONBOARDING_FLOW, value);
  } catch (err) {
    console.log(err);
  }
};
const setAppLanguage = async (value) => {
  try {
    await AsyncStorage.setItem("language", value);
  } catch (err) {
    console.log(err);
  }
};

const setFirstSignup = async (value) => {
  try {
    await AsyncStorage.setItem("first_signup", value);
  } catch (err) {
    console.log(err);
  }
};

const authDeviceStorage = {
  getShouldShowOnboardingFlow,
  getAppLanguage,
  setShouldShowOnboardingFlow,
  setAppLanguage,
  getFirstSignup,
  setFirstSignup,
};

export default authDeviceStorage;
