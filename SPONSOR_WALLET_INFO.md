# Sponsor Wallet 信息

⚠️ **重要：此文件包含敏感信息，请妥善保管，不要提交到 Git！**

## Sponsor 钱包信息

**地址：** `0x9d4fb7b8cb7492ff0a9d9244048849e6243146d8a1f14a65616189cf10cf56de`

**别名：** `eloquent-idocrase`

**密钥方案：** ED25519

**Recovery Phrase：**
```
enable marble cook grape emerge diesel sting clip panda suspect keen pill
```

**Bech32 私钥：**
```
suiprivkey1qqe2cxg3fwpg4v5n4m40wy45fl8l4mmwe0t5ymcdnz97ytpumrtnu42gfv8
```

**Public Key (Base64)：**
```
AGx3iLTa0+MQpQgeTtAEYIMsCp8SgOSqbtF8HIYkIBoM
```

**当前余额：** 10 SUI ✅ (已充值)

## 设置步骤

### 1. 在 Vercel 设置环境变量

在 Vercel 项目设置 → Environment Variables 添加：

- **SPONSOR_PRIVATE_KEY**: `suiprivkey1qqe2cxg3fwpg4v5n4m40wy45fl8l4mmwe0t5ymcdnz97ytpumrtnu42gfv8`（Bech32 格式，已支持）
- **SUI_NETWORK**: `devnet`
- **VITE_SPONSOR_API_URL**: `https://suihackathon-phi.vercel.app/api/sponsor`（或你的实际 Vercel URL）

### 2. 验证设置

部署到 Vercel 后，确保：
- ✅ 环境变量已正确设置
- ✅ Sponsor 钱包有足够的 SUI（当前：10 SUI）
- ✅ API 端点可以访问

### 3. 测试

1. 打开应用，进入 chatroom
2. 开启 "Use sponsored transactions" 开关
3. 发送消息，应该不需要钱包确认（sponsor 会支付 gas）

## 安全注意事项

- ⚠️ 此私钥仅用于 devnet 测试
- ⚠️ 不要在生产环境使用此私钥
- ⚠️ 不要将此文件提交到 Git（已在 .gitignore 中）
- ⚠️ 不要在前端代码中暴露私钥

## 使用

1. 部署到 Vercel 后，设置环境变量
2. 确保 sponsor 钱包有足够的 SUI（当前：10 SUI）
3. 在应用中开启 "Use sponsored transactions" 开关
4. 发送消息时，sponsor 会支付 gas 费用，用户无需签名

## 检查余额

```bash
sui client gas 0x9d4fb7b8cb7492ff0a9d9244048849e6243146d8a1f14a65616189cf10cf56de
```

## 充值（如果需要）

```bash
sui client faucet --address 0x9d4fb7b8cb7492ff0a9d9244048849e6243146d8a1f14a65616189cf10cf56de
```

或访问 Sui Discord Faucet：
https://discord.com/channels/916379725201563759/971488439931392130
