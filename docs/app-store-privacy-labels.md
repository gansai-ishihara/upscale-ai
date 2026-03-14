# App Store Connect - Privacy Nutrition Labels 設定ガイド

**対象アプリ:** UpScale AI (com.gansai.upscale-ai)
**最終更新:** 2026-03-14

---

## 前提整理

| SDK / 機能 | 収集データ | 備考 |
|---|---|---|
| Google AdMob | 広告ID、IPアドレス（おおよその位置）、デバイス情報、パフォーマンスデータ | デフォルト非パーソナライズ (`requestNonPersonalizedAdsOnly: true`)、ATT許可時のみパーソナライズ |
| RevenueCat | 購入履歴、サブスクリプション状態 | Apple決済経由、カード情報は取得しない |
| ローカル処理 | 日次処理回数 | デバイス内のみ、送信なし |
| 動画処理 | なし | 完全オンデバイス、サーバー送信なし |
| Analytics SDK | なし | 未導入 |

---

## App Store Connect での選択手順

### Step 1: 「Data Collection」の質問

> **Do you or your third-party partners collect data from this app?**

- [x] **Yes** を選択

---

### Step 2: 収集するデータタイプの選択

以下のカテゴリ **のみ** にチェックを入れる。それ以外はすべて未チェック。

#### Contact Info
- [ ] チェックしない（メール・電話番号等は収集しない）

#### Health & Fitness
- [ ] チェックしない

#### Financial Info
- [ ] チェックしない（決済はAppleが処理）

#### Location
- [x] **Coarse Location（おおよその位置情報）**
  - AdMob がIPアドレスからおおよその位置を推定するため

#### Sensitive Info
- [ ] チェックしない

#### Contacts
- [ ] チェックしない

#### User Content
- [ ] チェックしない（動画はオンデバイス処理、サーバー送信なし）

#### Browsing History
- [ ] チェックしない

#### Search History
- [ ] チェックしない

#### Identifiers
- [x] **Device ID（デバイスID）**
  - AdMob がデバイス識別情報を使用するため
- [x] **Advertising Identifier（広告ID / IDFA）**
  - ATT許可時にAdMobがパーソナライズ広告に使用するため（`requestNonPersonalizedAdsOnly`がATT許可時にfalseになる想定）

#### Purchases
- [x] **Purchase History（購入履歴）**
  - RevenueCat がサブスクリプション状態を管理するため

#### Usage Data
- [x] **Product Interaction（プロダクトインタラクション）**
  - AdMob が広告表示・クリックのインタラクションを収集するため
- [x] **Advertising Data（広告データ）**
  - AdMob が広告パフォーマンス（インプレッション等）を収集するため

#### Diagnostics
- [x] **Performance Data（パフォーマンスデータ）**
  - AdMob SDK がパフォーマンスメトリクスを収集するため
- [x] **Crash Data（クラッシュデータ）**
  - AdMob SDK がクラッシュログを収集する可能性があるため

#### Other Data
- [ ] チェックしない

---

### Step 3: 各データタイプの詳細設定

選択した各データタイプについて、以下の質問に回答する。

---

#### Coarse Location（おおよその位置情報）

| 質問 | 回答 |
|---|---|
| **Used for Tracking?** | **Yes**（ATT許可時のみ、広告パーソナライズに使用） |
| **Linked to User?** | No |
| **Purpose** | Third-Party Advertising |

#### Device ID（デバイスID）

| 質問 | 回答 |
|---|---|
| **Used for Tracking?** | **Yes**（ATT許可時のみ） |
| **Linked to User?** | No |
| **Purpose** | Third-Party Advertising |

#### Advertising Identifier（広告ID）

| 質問 | 回答 |
|---|---|
| **Used for Tracking?** | **Yes**（ATT許可時のみ） |
| **Linked to User?** | No |
| **Purpose** | Third-Party Advertising |

#### Purchase History（購入履歴）

| 質問 | 回答 |
|---|---|
| **Used for Tracking?** | No |
| **Linked to User?** | **Yes**（RevenueCatがユーザーの購入状態を紐付け管理） |
| **Purpose** | App Functionality |

#### Product Interaction（プロダクトインタラクション）

| 質問 | 回答 |
|---|---|
| **Used for Tracking?** | **Yes**（ATT許可時のみ） |
| **Linked to User?** | No |
| **Purpose** | Third-Party Advertising |

#### Advertising Data（広告データ）

| 質問 | 回答 |
|---|---|
| **Used for Tracking?** | **Yes**（ATT許可時のみ） |
| **Linked to User?** | No |
| **Purpose** | Third-Party Advertising |

#### Performance Data（パフォーマンスデータ）

| 質問 | 回答 |
|---|---|
| **Used for Tracking?** | No |
| **Linked to User?** | No |
| **Purpose** | Third-Party Advertising |

#### Crash Data（クラッシュデータ）

| 質問 | 回答 |
|---|---|
| **Used for Tracking?** | No |
| **Linked to User?** | No |
| **Purpose** | Third-Party Advertising |

---

### Step 4: 結果として表示されるラベル（期待値）

App Store上では以下のように表示される想定:

**Data Used to Track You:**
- Location (Coarse)
- Identifiers (Device ID, Advertising Identifier)
- Usage Data (Product Interaction, Advertising Data)

**Data Linked to You:**
- Purchases (Purchase History)

**Data Not Linked to You:**
- Diagnostics (Performance Data, Crash Data)

---

## 注意事項

1. **ATTダイアログ未許可時**: `requestNonPersonalizedAdsOnly: true` により非パーソナライズ広告のみ配信されるが、AdMob SDK自体はデバイス情報やIPアドレスを収集するため、Privacy Labelsでの申告は必要
2. **RevenueCat**: 匿名App User IDを使用している場合でも、購入履歴はユーザーに紐付けられるため「Linked to You」に該当
3. **ローカルデータ（日次処理回数）**: デバイス外に送信されないため、Privacy Labelsでの申告は不要
4. **動画データ**: 完全オンデバイス処理のため申告不要
5. **Google公式ガイド**: AdMobのPrivacy Labels推奨設定は https://developers.google.com/admob/ios/privacy/strategies を参照
6. **RevenueCat公式ガイド**: https://www.revenuecat.com/docs/apple-app-privacy を参照
