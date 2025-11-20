import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
  type User,
} from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { appConfig } from "../lib/app-config";
import { auth } from "../lib/firebase";

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const isExpoGo = Constants.appOwnership === "expo";
  const googleClientConfig = appConfig.googleAuth ?? {};
  const expoClientMissing = isExpoGo && !googleClientConfig.expoClientId;

  const [request, , promptAsync] = Google.useAuthRequest({
    expoClientId: googleClientConfig.expoClientId,
    iosClientId: googleClientConfig.iosClientId,
    androidClientId: googleClientConfig.androidClientId,
    webClientId: googleClientConfig.webClientId,
    responseType: "id_token",
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    if (!request) {
      Alert.alert("準備中", "Google認証の初期化が完了していません。少し待ってから再度お試しください。");
      return;
    }

    if (expoClientMissing) {
      Alert.alert(
        "Expo Goでは未対応",
        "GoogleログインをExpo Goで利用するには expo.extra.googleAuth.expoClientId を設定するか、expo-dev-client でビルドしたアプリを使用してください。",
      );
      return;
    }

    try {
      setAuthenticating(true);
      const result = await promptAsync({ useProxy: isExpoGo, showInRecents: true });

      if (result.type !== "success" || !result.params?.id_token) {
        if (result.type !== "dismissed") {
          Alert.alert("ログインがキャンセルされました");
        }
        return;
      }

      const credential = GoogleAuthProvider.credential(result.params.id_token);
      await signInWithCredential(auth, credential);
    } catch (error) {
      console.error("Failed to sign in with Google", error);
      Alert.alert("エラー", "Googleログインに失敗しました。ネットワーク状態とクライアントIDの設定を確認してください。");
    } finally {
      setAuthenticating(false);
    }
  }, [expoClientMissing, isExpoGo, promptAsync, request]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to sign out", error);
      Alert.alert("エラー", "ログアウトに失敗しました。");
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Firebase + Google 認証</Text>
        <Text style={styles.subtitle}>無料枠とサブスクを切り替えるための基盤をまず整えます。</Text>

        {initializing ? (
          <ActivityIndicator style={styles.loader} size="large" />
        ) : currentUser ? (
          <View style={styles.card}>
            {currentUser.photoURL ? <Image source={{ uri: currentUser.photoURL }} style={styles.avatar} /> : null}
            <Text style={styles.cardTitle}>{currentUser.displayName ?? "No display name"}</Text>
            <Text style={styles.cardSubtitle}>{currentUser.email}</Text>

            <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleSignOut}>
              <Text style={styles.buttonLabel}>ログアウト</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Googleでログイン</Text>
            <Text style={styles.cardSubtitle}>
              1日2回までの無料枠とサブスクの切り替えを実現するため、最初に確実な認証を整備します。
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                (!request || authenticating || expoClientMissing) && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              disabled={!request || authenticating || expoClientMissing}
              onPress={handleGoogleSignIn}
            >
              {authenticating ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonLabel}>Googleでログイン</Text>}
            </Pressable>

            {expoClientMissing ? (
              <Text style={styles.warning}>
                Expo Go でテストする場合は app.json の expo.extra.googleAuth.expoClientId に Expo 用のクライアントIDを設定してください。expo
                run:ios でビルドした Dev Client ならこのまま動作します。
              </Text>
            ) : null}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f6fb",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
  },
  loader: {
    marginTop: 48,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: "center",
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    backgroundColor: "#93c5fd",
  },
  warning: {
    fontSize: 12,
    color: "#b91c1c",
  },
});
