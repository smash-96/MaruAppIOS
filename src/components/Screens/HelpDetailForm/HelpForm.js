import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import { Button, TextInput, View, Text, Pressable } from "react-native";
import * as yup from "yup";
import { db } from "../../../firebase/firebaseConfig";
import { useSelector } from "react-redux";

import { selectUserType } from "../../../slices/userInfoSlice";
import UserAvatar from "../../Custom/UserAvatar/UserAvatar";
import dynamic_styles from "./styles";

import I18n from "../../../localization/utils/language";

const helpeeFieldsSchema = yup.object({
  //   title: yup.string().required().min(3),
  //   body: yup.string().required().min(8),
  //   rating: yup
  //     .string()
  //     .required()
  //     .test("is-rat-valid", "It should be between 1 - 5", (val) => {
  //       if (parseInt(val) > 0 && parseInt(val) < 6) {
  //         return true;
  //       }
  //       return false;
  //     }),

  subject: yup.string().required(),
  details: yup.string().required(),
  time: yup.string().required(),
});

const HelpForm = (props) => {
  const styles = dynamic_styles();
  const userType = useSelector(selectUserType);
  const baseAvatar =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  const [helpeeName, setHelpeeName] = useState("");
  const [helpeePhoto, setHelpeePhoto] = useState(baseAvatar || "");
  const [helpeeSubject, setHelpeeSubject] = useState("");
  const [helpeeDetails, setHelpeeDetails] = useState("");
  const [helpeeTime, setHelpeeTime] = useState("");

  if (userType === "helpee") {
    return (
      <View style={styles.centeredView}>
        <Formik
          initialValues={{ subject: "", details: "", time: "" }}
          //validationSchema={helpeeFieldsSchema}
          onSubmit={(values) => props.onSubmit(values)}
        >
          {(formikProps) => (
            <View style={styles.modalView}>
              <Text style={styles.modalText}>{I18n.t("helpForm.heading")}</Text>
              <View>
                <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                  {I18n.t("helpForm.subject")}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={I18n.t("helpForm.subject")}
                  // automatically handles the state of the form
                  onChangeText={formikProps.handleChange("subject")}
                  value={formikProps.values.subject}
                />

                <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                  {I18n.t("helpForm.details")}
                </Text>
                <TextInput
                  multiline
                  style={styles.Detailsinput}
                  placeholder={I18n.t("helpForm.details")}
                  onChangeText={formikProps.handleChange("details")}
                  value={formikProps.values.details}
                />

                <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                  {I18n.t("helpForm.time")}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={I18n.t("helpForm.time")}
                  onChangeText={formikProps.handleChange("time")}
                  value={formikProps.values.time}
                  keyboardType="numeric"
                />
              </View>

              <View style={{ marginTop: 10 }}>
                <Pressable
                  style={[styles.button, styles.buttonSubmit]}
                  onPress={formikProps.handleSubmit}
                >
                  <Text style={styles.textStyle}>
                    {I18n.t("helpForm.submit")}
                  </Text>
                </Pressable>
              </View>
              <View style={{ marginTop: 10 }}>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={props.onClose}
                >
                  <Text style={styles.textStyle}>
                    {I18n.t("helpForm.close")}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </Formik>
      </View>
    );
  } else if (userType === "helper") {
    useEffect(() => {
      const getHelpeeData = async () => {
        let data;

        const cRef1 = db.collection("Users").doc(props.data.helpeeID);
        data = await cRef1.get();
        setHelpeeName(data.data().fname + " " + data.data().lname);
        setHelpeePhoto(data.data().photoUrl);

        const cRef2 = db.collection("requests").doc(props.data.helpeeID);
        data = await cRef2.get();
        setHelpeeSubject(data.data().subject);
        setHelpeeDetails(data.data().details);
        setHelpeeTime(data.data().ttl);
      };

      getHelpeeData();
    }, []);

    return (
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <UserAvatar profilePic={helpeePhoto} drawer={true} />
          </View>
          {/* <Text
            style={{
              color: "black",
              marginTop: "3%",
              //fontFamily: "sans-serif-condensed",
              fontSize: 20,
            }}
          >
            {helpeeName}
          </Text> */}
          {/* Empty View */}
          <View style={styles.modalText}></View>
          <View>
            <View>
              <Text style={{ marginBottom: 4 }}>Subject</Text>
              <Text style={styles.input}>{helpeeSubject}</Text>
              <Text style={{ marginBottom: 4 }}>Details</Text>
              <Text style={styles.Detailsinput}>{helpeeDetails}</Text>
              <Text style={{ marginBottom: 4 }}>Time</Text>
              <Text style={styles.input}>{helpeeTime}</Text>
            </View>
          </View>
          <View style={{ marginTop: 10 }}>
            <Pressable
              style={[styles.button, styles.buttonSubmit]}
              onPress={props.onSubmit}
            >
              <Text style={styles.textStyle}>Accept Request</Text>
            </Pressable>
          </View>
          <View style={{ marginTop: 10 }}>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={props.onClose}
            >
              <Text style={styles.textStyle}>Reject Request</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }
};

export default HelpForm;
