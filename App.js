import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Pressable, Text, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';

export default function App() {
    const webViewRef = useRef(null);
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isAtTop, setIsAtTop] = useState(true);
    const [currentUrl, setCurrentUrl] = useState('https://dwrdraact3.vercel.app');

    // Detección scroll dentro del WebView
    const injectedJS = `
        (function() {
            function sendScroll() {
                window.ReactNativeWebView.postMessage(
                    String(window.scrollY || document.documentElement.scrollTop)
                );
            }
            window.addEventListener('scroll', sendScroll);
            sendScroll();
        })();
        true;
    `;

    const handleMessage = (event) => {
        const scrollY = Number(event.nativeEvent.data);
        setIsAtTop(scrollY <= 0);
    };

    const handleNavigationStateChange = (navState) => {
        setCanGoBack(navState.canGoBack);
        setCanGoForward(navState.canGoForward);
    };

    const goBack = () => {
        if (webViewRef.current && canGoBack) {
            webViewRef.current.goBack();
        }
    };

    const goForward = () => {
        if (webViewRef.current && canGoForward) {
            webViewRef.current.goForward();
        }
    };

    const reload = () => {
        webViewRef.current?.reload();
    };

    const onRefresh = () => {
        if (!isAtTop) return; // 🔑 solo si está arriba

        setRefreshing(true);
        webViewRef.current?.reload();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>

                <ScrollView
                    contentContainerStyle={{ flex: 1 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            enabled={isAtTop}
                            tintColor="#007AFF"
                            title="Recargando..."
                        />
                    }
                >
                    <WebView
                        ref={webViewRef}
                        source={{ uri: currentUrl }}
                        injectedJavaScript={injectedJS}
                        onMessage={handleMessage}
                        onNavigationStateChange={handleNavigationStateChange}
                        style={{ flex: 1 }}
                        onLoadEnd={() => setRefreshing(false)}
                    />
                </ScrollView>

                <View style={styles.navigationBar}>
                    <Pressable
                        onPress={goBack}
                        style={[styles.button, !canGoBack && styles.buttonDisabled]}
                        disabled={!canGoBack}
                    >
                        <Text style={[styles.buttonText, !canGoBack && styles.buttonTextDisabled]}>
                            ← Atrás
                        </Text>
                    </Pressable>

                    <Pressable onPress={reload} style={styles.button}>
                        <Text style={styles.buttonText}>⟳ Recargar</Text>
                    </Pressable>

                    <Pressable
                        onPress={goForward}
                        style={[styles.button, !canGoForward && styles.buttonDisabled]}
                        disabled={!canGoForward}
                    >
                        <Text style={[styles.buttonText, !canGoForward && styles.buttonTextDisabled]}>
                            Adelante →
                        </Text>
                    </Pressable>
                </View>

                <StatusBar style="auto" />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    navigationBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    buttonTextDisabled: {
        color: '#999',
    },
});