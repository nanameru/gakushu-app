## 概要

React Native New Architectureを有効にして、Expo SDK 54とReact 19で学習アプリを構築しました。最新技術スタックの採用により、型安全性とパフォーマンスを両立させながら、iOS・Android・Webのクロスプラットフォーム開発を実現した開発体験を共有します。

## 背景・前提

### プロジェクトの目的

「gakushu-app」は、モダンな学習体験を提供するモバイルアプリケーションです。プロジェクト開始時、以下の要件を満たす技術選定が必要でした。

- iOS・Android・Webの3プラットフォーム対応
- 高速なナビゲーションとスムーズなアニメーション
- メンテナンス性の高いコードベース
- 将来的な機能拡張への対応力

### 技術スタックの選定理由

最終的に採用した主要技術は以下の通りです。

- **Expo SDK 54**: 最新の安定版で、開発体験が大幅に向上
- **React 19.1.0**: React Compilerによる自動最適化
- **React Native 0.81.5**: New Architecture対応
- **Expo Router 6.0**: ファイルベースの型安全なルーティング
- **TypeScript 5.9**: 厳格な型チェック

この組み合わせは、2025年11月時点で最先端のreact-nativeとexpoの技術構成です。

## プロジェクト構成の工夫

### ファイルベースルーティングの採用

Expo Routerを使用したファイルベースルーティングにより、直感的な画面構成を実現しました。

```
app/
  _layout.tsx          # ルートレイアウト
  (tabs)/              # タブナビゲーショングループ
    _layout.tsx        # タブレイアウト
    index.tsx          # ホーム画面
    explore.tsx        # 探索画面
  modal.tsx            # モーダル画面
```

このディレクトリ構造により、URLとファイルパスが一致し、開発者の認知負荷が軽減されました。特に`(tabs)`というグループ構文は、URLに影響を与えずに論理的なグループ化を可能にします。

### コンポーネントの設計思想

再利用性を重視したコンポーネント設計を採用しました。

```typescript
components/
  ui/                  # 汎用UIコンポーネント
    collapsible.tsx
    icon-symbol.tsx
  themed-text.tsx      # テーマ対応テキスト
  themed-view.tsx      # テーマ対応ビュー
  parallax-scroll-view.tsx  # 演出効果
```

`ThemedText`と`ThemedView`は、ライト・ダークモードの切り替えを自動で処理します。これにより、画面ごとにテーマ対応を実装する必要がなくなりました。

### パスエイリアスの活用

TypeScriptの設定で`@/*`エイリアスを定義し、相対パスの地獄から解放されました。

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

これにより、深い階層からでも`@/components/themed-text`のように簡潔にインポートできます。

## React Native New Architectureの有効化

### 有効化の決断

プロジェクト開始時、New Architectureはまだ実験的な機能でした。しかし、以下の理由から有効化を決断しました。

1. 将来的な移行コストの削減
2. パフォーマンスの向上（特にJSI経由のネイティブモジュール呼び出し）
3. Turbo ModulesとFabricによる恩恵

app.jsonでの設定は1行で完了します。

```json
{
  "expo": {
    "newArchEnabled": true
  }
}
```

### 直面した課題

New Architectureを有効にした際、いくつかの互換性問題に遭遇しました。

**react-native-reanimatedの設定**

アニメーションライブラリのバージョン4.1.1を使用しましたが、New Architecture対応のため、追加設定が必要でした。ドキュメント（https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/）を参照し、`react-native-worklets`の依存関係を明示的に追加することで解決しました。

**Gesture Handlerの統合**

`react-native-gesture-handler`もNew Architectureに対応したバージョン2.28.0を採用。レイアウトルートでのラップが必須であることを忘れずに実装しました。

## React Compilerの実験的導入

### React Compilerとは

React 19で導入されたReact Compilerは、手動での`useMemo`や`useCallback`の使用を不要にする自動最適化機能です。

app.jsonで有効化しました。

```json
{
  "experiments": {
    "reactCompiler": true
  }
}
```

### 実感した効果

開発初期段階のため定量的な効果測定はまだですが、以下の点で開発体験が向上しました。

- メモ化を意識したコード記述が不要
- パフォーマンスチューニングの時間削減
- コードの可読性向上

特に`ParallaxScrollView`のような複雑なアニメーションコンポーネントで、明示的な最適化なしでスムーズな動作を実現できました。

## Expo Routerによる型安全なナビゲーション

### Typed Routesの有効化

Expo Routerの型安全機能を有効にすることで、存在しない画面への遷移をコンパイル時にキャッチできます。

```json
{
  "experiments": {
    "typedRoutes": true
  }
}
```

これにより、`.expo/types/router.d.ts`に自動生成される型定義を利用できます。

### 実装例

```typescript
import { Link } from 'expo-router';

// 型安全なナビゲーション
<Link href="/modal">
  <Link.Trigger>
    <ThemedText type="subtitle">Step 2: Explore</ThemedText>
  </Link.Trigger>
</Link>
```

存在しないパス（例: `/nonexistent`）を指定すると、TypeScriptエラーが発生します。大規模アプリケーションでのルーティングミスを防ぐ強力な機能です。

## マルチプラットフォーム対応の実践

### プラットフォーム別分岐

React Nativeの`Platform`モジュールを活用し、必要な箇所でプラットフォーム固有の処理を実装しました。

```typescript
import { Platform } from 'react-native';

const shortcut = Platform.select({
  ios: 'cmd + d',
  android: 'cmd + m',
  web: 'F12',
});
```

### iOS専用の演出効果

Parallax効果はiOSでのみ表示するなど、各プラットフォームの特性を活かした設計を心がけました。

```typescript
{Platform.select({
  ios: (
    <ThemedText>
      The <ThemedText type="defaultSemiBold">
        components/ParallaxScrollView.tsx
      </ThemedText> component provides a parallax effect.
    </ThemedText>
  ),
})}
```

### Web対応の設定

Webビルドは静的出力を選択し、ホスティングコストを削減しました。

```json
{
  "web": {
    "output": "static",
    "favicon": "./assets/images/favicon.png"
  }
}
```

## UIデザインとアニメーション

### SF Symbolsの活用

iOS標準のSF Symbolsを`IconSymbol`コンポーネントでラップし、統一感のあるアイコン表示を実現しました。

```typescript
<IconSymbol
  size={310}
  color="#808080"
  name="chevron.left.forwardslash.chevron.right"
/>
```

### Parallax効果の実装

`ParallaxScrollView`コンポーネントは、スクロールに応じてヘッダー画像が動く演出を提供します。react-native-reanimatedを使用し、60fpsのスムーズなアニメーションを実現しました。

### ダークモード対応

`useColorScheme`フックとテーマ対応コンポーネントにより、システム設定に応じた自動切り替えを実装しました。

```typescript
headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
```

すべてのカラー定義でライト・ダーク両方を指定することで、一貫したテーマ体験を提供します。

## 開発環境とツール

### 高速な開発サイクル

Expo CLIによるホットリロードにより、コード変更が即座に反映されます。

```bash
npx expo start
```

起動後、以下のショートカットで各プラットフォームを素早く起動できます。

- `i`: iOS Simulator
- `a`: Android Emulator
- `w`: Web Browser

### リンティングとコード品質

ESLint 9.25とexpo-config-expoにより、Expoのベストプラクティスに準拠したコード品質を維持しています。

```bash
npm run lint
```

厳格なTypeScript設定（`"strict": true`）により、型安全性を最大限に活用しています。

## 苦労した点とトラブルシューティング

### React 19とライブラリの互換性

React 19は2025年11月時点で最新版ですが、一部のライブラリではまだ正式サポートが追いついていない状況でした。特に以下の点に注意が必要でした。

- 型定義の不整合（`@types/react`との整合性）
- 非推奨APIの警告（Console Warningの確認）

解決策として、Expo公式ドキュメント（https://docs.expo.dev/）で推奨されるバージョンを優先的に採用しました。

### New Architecture有効時のデバッグ

New Architectureではブリッジを経由しないため、従来のデバッグ手法が使えないケースがありました。

Chrome DevToolsの代わりに、Flipper（https://fbflipper.com/）を使用することで、ネイティブレイヤーまで含めた包括的なデバッグが可能になりました。

### プラットフォーム間の挙動差異

同じコードでも、iOS・Android・Webで微妙に挙動が異なる場面がありました。

対処法：
- 各プラットフォームで実機テストを頻繁に実施
- `Platform.select`で明示的に分岐
- 共通化できる部分と分岐すべき部分の見極め

## パフォーマンス最適化

### 画像最適化

`expo-image`を使用することで、ネイティブレベルの高速な画像表示を実現しました。

```typescript
import { Image } from 'expo-image';

<Image
  source={require('@/assets/images/partial-react-logo.png')}
  style={styles.reactLogo}
/>
```

従来の`react-native`の`Image`コンポーネントより、メモリ使用量が削減され、読み込み速度が向上しました。

### レスポンシブ画像

`@2x`、`@3x`サフィックスを活用し、デバイスの画面密度に応じた最適な画像を自動選択しています。

```
assets/images/
  react-logo.png      # 1x
  react-logo@2x.png   # 2x
  react-logo@3x.png   # 3x
```

## セキュリティとベストプラクティス

### Deep Linkingの設定

アプリ固有のURLスキーム`gakushuapp://`を設定し、外部からの安全な起動を実現しました。

```json
{
  "scheme": "gakushuapp"
}
```

### Edge to Edgeデザイン

Androidでは`edgeToEdgeEnabled: true`を設定し、画面全体を活用したモダンなデザインを採用しました。これによりステータスバーとナビゲーションバーの背後まで描画できます。

```json
{
  "android": {
    "edgeToEdgeEnabled": true
  }
}
```

Safe Area Contextと組み合わせることで、ノッチやホームインジケータへの考慮も自動化されています。

## 今後の展開

### 機能拡張の計画

現在はスターター構成ですが、以下の機能を順次実装予定です。

- 学習コンテンツの表示・管理
- プログレストラッキング
- オフライン対応
- プッシュ通知
- ソーシャル機能（進捗共有）

### 技術的な改善点

開発を通じて見えてきた改善ポイント：

- React Native Testing Libraryによる自動テスト強化
- Supabaseなどのバックエンド統合
- アナリティクスの導入（Expo Analytics）
- CI/CDパイプラインの構築（EAS Build）

## 参考・出典

本プロジェクトで参照した主要ドキュメント：

- Expo公式ドキュメント: https://docs.expo.dev/
- React Native New Architecture: https://reactnative.dev/docs/the-new-architecture/landing-page
- Expo Router: https://docs.expo.dev/router/introduction/
- React Reanimated: https://docs.swmansion.com/react-native-reanimated/
- React 19リリースノート: https://react.dev/blog/2025/11/20/react-v19

## まとめ・次アクション

### 得られた知見

最新のexpoとreact-nativeスタックでの開発を通じて、以下の知見を得ました。

- New Architectureは本番投入可能な成熟度に到達
- React Compilerによる開発体験の大幅な向上
- Expo Routerの型安全性は大規模開発に不可欠
- クロスプラットフォーム開発の効率性

### 読者が今日できること

この記事を読んだ方が即座に試せるアクション：

1. Expoプロジェクトを最新バージョンで作成する
```bash
npx create-expo-app@latest --template tabs
```

2. New Architectureを有効化してパフォーマンスを体感する
3. Expo Routerでファイルベースルーティングを試す
4. React Compilerの自動最適化を確認する
5. 3プラットフォームで同時に動作確認する（`npm start`後に`i`、`a`、`w`）

### 最後に

学習アプリという比較的シンプルな要件でも、最新技術スタックを採用することで多くの学びがありました。特にNew ArchitectureとReact Compilerの組み合わせは、今後のreact-native開発のスタンダードになると確信しています。

この開発体験が、これからモバイルアプリ開発を始める方、あるいは既存アプリのモダナイゼーションを検討している方の参考になれば幸いです。

