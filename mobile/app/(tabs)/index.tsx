import {  Text, ScrollView, Button } from "react-native";
import React from "react";
import { useApi } from "@/lib/axios";
import * as Sentry from "@sentry/react-native";
const ChatsTab = () => {
  const api = useApi();
  api
    .get("/users")
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err));
  return (
    <ScrollView
      className="bg-surface"
      contentInsetAdjustmentBehavior="automatic">
      <Text className="text-white">ChatsTab</Text>
      {/* <Button title='Try!' onPress={ () => { Sentry.captureException(new Error('First error')) }}/> */}
    </ScrollView>
  );
};

export default ChatsTab;
