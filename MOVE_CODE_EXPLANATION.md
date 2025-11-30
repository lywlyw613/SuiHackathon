# Move 代码解释文档

本文档记录 Sui Chat dApp 的 Move 智能合约代码的详细解释，包括设计决策和实现细节。

## 目录结构

- `sui_chat.move` - 主入口模块，包含 `create_chatroom` 和 `send_message` 函数
- `chatroom.move` - Chatroom 共享对象定义
- `chat.move` - Chat 对象定义
- `key.move` - Key 对象定义（用于访问控制）

---

## 1. sui_chat.move - 主入口模块

### 模块声明和导入

```move
module sui_chat::sui_chat;

use sui_chat::chatroom::{Self, Chatroom};
use sui_chat::chat::{Self, Chat};
use sui_chat::key::{Self, Key};
use sui::object::{Self, ID};
use sui::tx_context::{Self, TxContext};
use sui::transfer;
use sui::clock::{Self, Clock};
use std::option;
use std::vector;
```

**解释：**
- `module sui_chat::sui_chat` - 定义模块名称，`sui_chat` 是包名，`sui_chat` 是模块名
- 导入其他模块：`chatroom`、`chat`、`key`
- 导入 Sui 标准库：`object`（对象操作）、`tx_context`（交易上下文）、`transfer`（对象转移）、`clock`（时间戳）
- 导入 Move 标准库：`option`（可选类型）、`vector`（向量）

### 错误代码常量

```move
const EInvalidPreviousChatId: u64 = 1;
const EKeyMismatch: u64 = 2;
const EEmptyMemberList: u64 = 3;
const EInvalidKeyLength: u64 = 4;
```

**解释：**
- 定义错误代码，用于 `assert!` 失败时返回
- `EInvalidPreviousChatId` - 前一个聊天 ID 不匹配（并发冲突）
- `EKeyMismatch` - Key 对象不属于该 chatroom
- `EEmptyMemberList` - 成员列表为空
- `EInvalidKeyLength` - 密钥长度不是 32 字节（AES-256 要求）

### 系统消息常量

```move
const SYSTEM_MESSAGE: vector<u8> = b"This chat is encrypted and recorded on Sui Chain";
```

**解释：**
- 第一个聊天消息（系统消息），用于初始化 chatroom
- 不加密，作为聊天历史的起点

---

### create_chatroom 函数

```move
public fun create_chatroom(
    member_addresses: vector<address>,
    key: vector<u8>, // 32 bytes for AES-256-GCM
    clock: &Clock,
    ctx: &mut TxContext,
) {
```

**函数签名解释：**
- `public fun` - 公开函数，可以从外部调用
- `member_addresses: vector<address>` - 成员地址列表
- `key: vector<u8>` - 加密密钥（32 字节，AES-256）
- `clock: &Clock` - Clock 对象引用（用于获取时间戳）
- `ctx: &mut TxContext` - 交易上下文（可变引用）

**为什么需要 Clock？**
- `clock::timestamp_ms(clock)` 提供链上时间戳
- 比 `tx_context::epoch_timestamp_ms(ctx)` 更准确，因为 Clock 是共享对象，由验证者维护

**函数流程：**

1. **验证密钥长度**
```move
assert!(vector::length(&key) == 32, EInvalidKeyLength);
```
- 确保密钥是 32 字节（AES-256-GCM 要求）

2. **验证成员列表**
```move
assert!(vector::length(&member_addresses) > 0, EEmptyMemberList);
```
- 确保至少有一个成员

3. **获取创建者地址**
```move
let creator = tx_context::sender(ctx);
```
- 从交易上下文获取发送者地址

4. **创建 Chatroom 对象**
```move
let mut chatroom = chatroom::create(creator, ctx);
let chatroom_id = object::id(&chatroom);
```
- 创建 Chatroom 共享对象
- `mut` 表示可变，因为后续需要更新 `last_chat_id`
- 获取 chatroom 的 ID

5. **创建第一个系统消息**
```move
let first_chat = chat::create(
    chatroom_id,
    creator,
    option::none(), // No previous chat
    SYSTEM_MESSAGE,
    clock,
    ctx,
);
let first_chat_id = chat::id(&first_chat);
```
- 创建第一个 Chat 对象（系统消息）
- `previous_chat_id` 为 `none`（没有前一个消息）
- 使用 `clock` 获取时间戳

6. **转移第一个消息给创建者**
```move
transfer::public_transfer(first_chat, creator);
```
- 将 Chat 对象转移给创建者（owned object）

7. **更新 Chatroom 的 last_chat_id**
```move
chatroom::update_last_chat_id(&mut chatroom, first_chat_id);
```
- 设置 chatroom 的最后一个消息 ID

8. **创建并分发 Key 对象**
```move
let len = vector::length(&member_addresses);
let mut i = 0;
while (i < len) {
    let member = *vector::borrow(&member_addresses, i);
    let key_obj = key::create(chatroom_id, key, ctx);
    transfer::public_transfer(key_obj, member);
    i = i + 1;
};
```
- 遍历所有成员地址
- 为每个成员创建一个 Key 对象（包含相同的加密密钥）
- 将 Key 对象转移给成员（owned object）

**为什么每个成员都有相同的 key？**
- 所有成员使用相同的密钥来加密/解密消息
- Key 对象用于访问控制（验证是否有权限发送消息）

9. **共享 Chatroom 对象**
```move
chatroom::share(chatroom);
```
- 将 Chatroom 转为共享对象（shared object）
- 共享对象可以被任何人读取，但修改需要交易

**为什么 Chatroom 是共享对象？**
- 需要多个用户同时访问和更新（发送消息）
- 共享对象支持并发访问（通过版本控制）

---

### send_message 函数

```move
public fun send_message(
    chatroom: &mut Chatroom,
    key: &Key,
    previous_chat_id: option::Option<ID>,
    encrypted_content: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
```

**函数签名解释：**
- `chatroom: &mut Chatroom` - Chatroom 共享对象（可变引用，需要更新 `last_chat_id`）
- `key: &Key` - Key 对象引用（用于验证权限）
- `previous_chat_id: option::Option<ID>` - 前一个消息的 ID（用于防止并发冲突）
- `encrypted_content: vector<u8>` - 加密后的消息内容
- `clock: &Clock` - Clock 对象引用
- `ctx: &mut TxContext` - 交易上下文

**函数流程：**

1. **获取 chatroom_id 和 sender**
```move
let chatroom_id = object::id(chatroom);
let sender = tx_context::sender(ctx);
```

2. **验证 Key 是否属于该 chatroom**
```move
assert!(key::verify_chatroom(key, chatroom_id), EKeyMismatch);
```
- 确保用户拥有该 chatroom 的 Key 对象
- 这是访问控制的核心机制

3. **验证 previous_chat_id 是否匹配**
```move
let current_last_chat_id = chatroom::last_chat_id(chatroom);
let matches = if (option::is_some(&current_last_chat_id) && option::is_some(&previous_chat_id)) {
    let current_id = *option::borrow(&current_last_chat_id);
    let prev_id = *option::borrow(&previous_chat_id);
    current_id == prev_id
} else {
    option::is_none(&current_last_chat_id) && option::is_none(&previous_chat_id)
};
assert!(matches, EInvalidPreviousChatId);
```

**为什么需要这个验证？**
- **防止并发冲突**：如果两个用户同时发送消息，只有一个会成功
- 前端在发送前会读取 `chatroom.last_chat_id`，然后作为 `previous_chat_id` 传入
- 如果 `previous_chat_id` 与 `chatroom.last_chat_id` 不匹配，说明在准备交易期间，chatroom 已经被更新了
- 失败的交易会被拒绝，用户需要重新读取最新的 `last_chat_id` 并重试

**逻辑解释：**
- 如果两者都是 `some`，比较它们的值是否相等
- 如果两者都是 `none`，也认为匹配（初始状态）
- 否则不匹配，抛出错误

4. **创建新的 Chat 对象**
```move
let new_chat = chat::create(
    chatroom_id,
    sender,
    previous_chat_id,
    encrypted_content,
    clock,
    ctx,
);
let new_chat_id = chat::id(&new_chat);
```

5. **更新 Chatroom 的 last_chat_id**
```move
chatroom::update_last_chat_id(chatroom, new_chat_id);
```
- 原子操作：更新共享对象的 `last_chat_id`
- 这确保了消息的顺序性

6. **转移 Chat 对象给发送者**
```move
transfer::public_transfer(new_chat, sender);
```
- Chat 对象是 owned object，属于发送者

---

## 2. chatroom.move - Chatroom 共享对象

### 结构体定义

```move
public struct Chatroom has key {
    id: UID,
    creator: address,
    last_chat_id: option::Option<ID>,
    created_at: u64,
}
```

**解释：**
- `has key` - 表示这是一个对象（必须有 `id: UID`）
- `id: UID` - 对象的唯一标识符
- `creator: address` - 创建者地址
- `last_chat_id: option::Option<ID>` - 最后一个消息的 ID（可选）
- `created_at: u64` - 创建时间戳（毫秒）

**为什么没有 `has store`？**
- Chatroom 是共享对象，不需要 `store` ability
- 共享对象不能被转移，只能被共享

### create 函数

```move
public fun create(
    creator: address,
    ctx: &mut TxContext,
): Chatroom {
    Chatroom {
        id: object::new(ctx),
        creator,
        last_chat_id: option::none(),
        created_at: tx_context::epoch_timestamp_ms(ctx),
    }
}
```

**解释：**
- `object::new(ctx)` - 创建新的 UID
- `last_chat_id` 初始为 `none`（还没有消息）
- `created_at` 使用 `tx_context::epoch_timestamp_ms(ctx)`（创建时的时间戳）

**为什么 created_at 用 tx_context 而不用 Clock？**
- Chatroom 创建时不需要 Clock 对象
- `tx_context::epoch_timestamp_ms` 足够准确（创建时间）

### update_last_chat_id 函数

```move
public(package) fun update_last_chat_id(
    chatroom: &mut Chatroom,
    new_chat_id: ID,
) {
    chatroom.last_chat_id = option::some(new_chat_id);
}
```

**解释：**
- `public(package)` - 只有同一包内的模块可以调用
- 用于更新 `last_chat_id`（原子操作）

**为什么是 `public(package)` 而不是 `public`？**
- 防止外部直接修改 `last_chat_id`
- 只能通过 `send_message` 函数来更新（确保逻辑正确）

### share 函数

```move
public fun share(chatroom: Chatroom) {
    transfer::share_object(chatroom);
}
```

**解释：**
- 将 Chatroom 转为共享对象
- 共享对象可以被任何人读取，但修改需要交易

---

## 3. chat.move - Chat 对象

### 结构体定义

```move
public struct Chat has key, store {
    id: UID,
    chatroom_id: ID,
    sender: address,
    timestamp: u64,
    previous_chat_id: option::Option<ID>,
    encrypted_content: vector<u8>,
}
```

**字段详解：**

1. **`id: UID`** - 对象的唯一标识符
   - 每个 Chat 对象都有唯一的 ID
   - 用于在链上查询和引用

2. **`chatroom_id: ID`** - 所属 chatroom 的 ID
   - 标识这个消息属于哪个 chatroom
   - 用于过滤和查询特定 chatroom 的消息

3. **`sender: address`** - 发送者的钱包地址
   - 标识谁发送了这条消息
   - 用于显示消息发送者

4. **`timestamp: u64`** - 时间戳（毫秒）
   - 消息发送的时间
   - 使用 `clock::timestamp_ms(clock)` 获取

5. **`previous_chat_id: option::Option<ID>`** - 前一个消息的 ID
   - 用于构建**链表结构**（linked list）
   - `Option::none()` - 第一个消息（没有前一个）
   - `Option::some(id)` - 其他消息（指向前一个消息的 ID）

6. **`encrypted_content: vector<u8>`** - 加密后的消息内容
   - 使用 AES-256-GCM 加密
   - 包含 IV（12 字节）+ 加密内容

### 为什么使用 `has key, store` abilities？

**`has key` ability：**
- 使 Chat 成为 Sui 对象
- 必须有 `id: UID` 字段
- 对象可以被存储在链上

**`has store` ability：**
- 允许 Chat 对象被转移（transfer）
- 在 `send_message` 中，Chat 对象被转移给发送者：
  ```move
  transfer::public_transfer(new_chat, sender);
  ```

**为什么 Chat 是 owned object（而不是 shared object）？**
- ✅ 每个消息属于发送者（owned by sender）
- ✅ 查询效率高：可以通过 `sui_getOwnedObjects` 查询用户发送的所有消息
- ✅ 不需要版本控制（不像 shared object）
- ✅ 符合"谁发送谁拥有"的语义

**如果 Chat 是 shared object 会怎样？**
- ❌ 无法确定消息的发送者（shared object 没有 owner）
- ❌ 查询效率低，无法通过 `sui_getOwnedObjects` 查询
- ❌ 增加不必要的复杂性

### 为什么 `previous_chat_id` 是 `Option<ID>`？

**`Option<T>` 的作用：**
- `Option::none()` - 表示"没有值"
- `Option::some(value)` - 表示"有值"

**为什么需要 Option？**
- **第一个消息**：没有前一个消息，所以是 `Option::none()`
- **其他消息**：有前一个消息，所以是 `Option::some(previous_id)`

**链表结构示例：**

```
Chatroom.last_chat_id → Chat3.id
                         ↓
                    previous_chat_id: some(Chat2.id)
                         ↓
                    Chat2.id
                         ↓
                    previous_chat_id: some(Chat1.id)
                         ↓
                    Chat1.id
                         ↓
                    previous_chat_id: none()  ← 第一个消息
```

**前端如何遍历聊天历史：**

```typescript
// 从 chatroom.last_chat_id 开始
let currentChatId = chatroom.last_chat_id;

while (currentChatId !== null) {
  // 获取当前 Chat 对象
  const chat = await client.getObject({
    id: currentChatId,
    options: { showContent: true }
  });
  
  // 解密并显示消息
  const decrypted = await decryptMessage(
    chat.encrypted_content,
    key
  );
  
  // 移动到前一个消息
  currentChatId = chat.previous_chat_id; // Option::none() 时是 null
}
```

**为什么用链表而不是数组？**
- ✅ **节省 gas**：不需要在 Chatroom 中存储所有消息 ID
- ✅ **可扩展**：可以无限添加消息，不需要修改 Chatroom
- ✅ **去中心化**：每个消息是独立的对象，可以独立查询

### create 函数

```move
public fun create(
    chatroom_id: ID,
    sender: address,
    previous_chat_id: option::Option<ID>,
    encrypted_content: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext,
): Chat {
    Chat {
        id: object::new(ctx),
        chatroom_id,
        sender,
        timestamp: clock::timestamp_ms(clock),
        previous_chat_id,
        encrypted_content,
    }
}
```

**函数参数解释：**

1. **`chatroom_id: ID`** - 从 `sui_chat::send_message` 传入
   - 标识消息属于哪个 chatroom

2. **`sender: address`** - 从 `tx_context::sender(ctx)` 获取
   - 自动获取交易发送者的地址
   - 确保消息发送者不能被伪造

3. **`previous_chat_id: option::Option<ID>`** - 从 `sui_chat::send_message` 传入
   - 前端在发送前读取 `chatroom.last_chat_id`
   - 用于防止并发冲突

4. **`encrypted_content: vector<u8>`** - 从前端传入
   - 前端使用 AES-256-GCM 加密消息
   - 包含 IV（12 字节）+ 加密内容

5. **`clock: &Clock`** - Clock 对象引用（地址 `0x6`）
   - 用于获取准确的时间戳

6. **`ctx: &mut TxContext`** - 交易上下文
   - 用于创建新的 UID

**为什么使用 `clock::timestamp_ms(clock)` 而不是 `tx_context::epoch_timestamp_ms(ctx)`？**

| 方法 | 来源 | 精度 | 为什么选择？ |
|------|------|------|------------|
| `clock::timestamp_ms(clock)` | Clock 共享对象 | 高（由验证者维护） | ✅ **使用** - 更准确 |
| `tx_context::epoch_timestamp_ms(ctx)` | 交易上下文 | 中（交易时间戳） | ❌ 不够精确 |

**Clock 对象的优势：**
- Clock 是共享对象，由 Sui 验证者维护
- 时间戳更准确，反映链上的实际时间
- 多个交易可以共享同一个 Clock 对象

### Getter 函数

```move
/// Get the chat ID
public fun id(chat: &Chat): ID {
    object::id(chat)
}

/// Get the chatroom ID
public fun chatroom_id(chat: &Chat): ID {
    chat.chatroom_id
}

/// Get the sender address
public fun sender(chat: &Chat): address {
    chat.sender
}

/// Get the timestamp
public fun timestamp(chat: &Chat): u64 {
    chat.timestamp
}

/// Get the previous chat ID
public fun previous_chat_id(chat: &Chat): option::Option<ID> {
    chat.previous_chat_id
}

/// Get the encrypted content
public fun encrypted_content(chat: &Chat): vector<u8> {
    chat.encrypted_content
}
```

**为什么需要这些 getter 函数？**
- Move 语言中，结构体字段默认是**私有的**（private）
- 需要 `public fun` 函数来访问字段
- 提供只读访问，保护数据完整性

**前端如何使用这些 getter？**
- 前端通过 `getObject` API 直接读取对象字段
- Sui SDK 会自动解析对象内容
- 不需要显式调用这些 getter 函数（它们主要用于 Move 内部）

### 实际使用场景

**1. 创建消息（在 `send_message` 中）：**

```move
// 在 sui_chat.move 中
let new_chat = chat::create(
    chatroom_id,
    sender,
    previous_chat_id,
    encrypted_content,
    clock,
    ctx,
);
let new_chat_id = chat::id(&new_chat);
transfer::public_transfer(new_chat, sender); // 转移给发送者
```

**2. 前端查询消息：**

```typescript
// 从 chatroom.last_chat_id 开始
const chatroom = await client.getObject({
  id: chatroomId,
  options: { showContent: true }
});

let currentChatId = chatroom.data.content.fields.last_chat_id;

// 遍历链表
while (currentChatId) {
  const chat = await client.getObject({
    id: currentChatId,
    options: { showContent: true }
  });
  
  // 解密消息
  const decrypted = await decryptMessage(
    chat.data.content.fields.encrypted_content,
    key
  );
  
  // 移动到前一个消息
  currentChatId = chat.data.content.fields.previous_chat_id;
}
```

**3. 显示消息时间：**

```typescript
const timestamp = chat.data.content.fields.timestamp; // u64 (毫秒)
const date = new Date(Number(timestamp));
const formatted = formatDistanceToNow(date, { addSuffix: true });
// "2 minutes ago"
```

### 设计决策总结

**为什么 Chat 是 owned object？**
- ✅ 每个消息属于发送者
- ✅ 查询效率高
- ✅ 符合"谁发送谁拥有"的语义

**为什么使用链表结构？**
- ✅ 节省 gas（不需要在 Chatroom 中存储所有 ID）
- ✅ 可扩展（可以无限添加消息）
- ✅ 去中心化（每个消息是独立对象）

**为什么 previous_chat_id 是 Option？**
- ✅ 第一个消息没有前一个（`none`）
- ✅ 其他消息有前一个（`some(id)`）
- ✅ 类型安全，避免空指针错误

**为什么使用 Clock 获取时间戳？**
- ✅ 时间戳更准确（由验证者维护）
- ✅ 多个交易可以共享同一个 Clock
- ✅ 比 `tx_context::epoch_timestamp_ms` 更可靠

---

## 4. key.move - Key 对象

### 结构体定义

```move
public struct Key has key, store {
    id: UID,
    chatroom_id: ID,
    key: vector<u8>, // 32 bytes for AES-256-GCM
}
```

**解释：**
- `has key, store` - 对象可以被拥有和转移
- `id: UID` - 对象 ID
- `chatroom_id: ID` - 所属 chatroom 的 ID
- `key: vector<u8>` - 加密密钥（32 字节）

### 为什么 key 是 `vector<u8>`？

**1. 加密密钥的本质：**
- 加密密钥在计算机中本质上是**字节序列**（byte array）
- AES-256-GCM 算法需要 **32 字节（256 位）**的密钥
- 每个字节是 0-255 的整数值（`u8` = unsigned 8-bit integer）

**2. Move 语言中的表示：**
- `vector<u8>` 是 Move 语言中表示**字节数组**的标准方式
- `vector` - 动态数组
- `u8` - 无符号 8 位整数（0-255，正好是一个字节）

**3. 前端与链上的数据转换：**

**前端生成密钥：**
```typescript
// sui_hackathon/src/lib/crypto.ts
export function generateKey(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32)); // 32 字节
}
```

**前端使用密钥加密：**
```typescript
export async function encryptMessage(
  message: string,
  key: Uint8Array  // TypeScript 中的 Uint8Array
): Promise<Uint8Array> {
  // Web Crypto API 使用 Uint8Array
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key as unknown as ArrayBuffer,  // 转换为 ArrayBuffer
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  // ...
}
```

**前端发送到链上：**
```typescript
// 在 CreateChatroomPage.tsx 中
const key = generateKey(); // Uint8Array (32 bytes)
const tx = new Transaction();
tx.moveCall({
  package: PACKAGE_ID,
  module: MODULE_NAMES.SUI_CHAT,
  function: FUNCTION_NAMES.CREATE_CHATROOM,
  arguments: [
    tx.pure.vector("address", memberAddresses),
    tx.pure.vector("u8", Array.from(key)), // 转换为 number[] 然后传给 Move
    tx.object("0x6"),
  ],
});
```

**Move 合约接收：**
```move
public fun create_chatroom(
    member_addresses: vector<address>,
    key: vector<u8>, // 接收 32 字节的密钥
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(vector::length(&key) == 32, EInvalidKeyLength); // 验证长度
    // ...
}
```

**4. 为什么不用其他类型？**

| 类型 | 是否可行？ | 为什么？ |
|------|----------|---------|
| `vector<u8>` | ✅ **使用** | 标准字节数组，灵活，支持任意长度 |
| `u256` | ❌ | 固定 256 位，但 Move 没有原生 `u256` 类型 |
| `string` | ❌ | 字符串需要编码/解码，效率低，容易出错 |
| `address` | ❌ | `address` 只有 20 字节，不够 32 字节 |
| 固定数组 `[u8; 32]` | ⚠️ | Move 不支持固定大小数组，只能用 `vector` |

**5. 数据流示例：**

```
前端生成密钥：
  crypto.getRandomValues(new Uint8Array(32))
  → [123, 45, 67, ...] (32 个字节)

转换为 Move 参数：
  Array.from(key)
  → [123, 45, 67, ...] (number[])

发送到链上：
  tx.pure.vector("u8", [123, 45, 67, ...])
  → vector<u8> in Move

存储在 Key 对象中：
  key: vector<u8> = [123, 45, 67, ...]

从链上读取：
  key::key(&key_obj)
  → vector<u8>

前端使用：
  new Uint8Array([123, 45, 67, ...])
  → 用于 Web Crypto API 加密/解密
```

**6. 为什么是 32 字节？**

- **AES-256** 需要 256 位 = 32 字节的密钥
- 这是 AES-GCM 算法的标准要求
- 32 字节提供足够的安全性（256 位加密强度）

**验证密钥长度：**
```move
// 在 create_chatroom 中
assert!(vector::length(&key) == 32, EInvalidKeyLength);
```

**总结：**
- `vector<u8>` 是 Move 中表示字节数组的标准方式
- 与前端 `Uint8Array` 完美对应
- 支持 AES-256-GCM 所需的 32 字节密钥
- 灵活且类型安全

### 为什么使用 `has key` ability？

**`key` ability 的作用：**
- 使结构体成为一个 **Sui 对象**（Object）
- 必须有 `id: UID` 字段
- 对象可以被存储在全局存储中
- 对象可以被拥有（owned）或共享（shared）

**如果没有 `key` ability：**
- 结构体只是一个普通的数据结构，不能作为对象存储在链上
- 无法被用户拥有
- 无法通过对象 ID 查询

**为什么 Key 需要是对象？**
- 需要存储在链上，让用户拥有
- 需要唯一标识（通过 `id: UID`）
- 需要作为访问控制的凭证（拥有 Key = 有权限发送消息）

### 为什么使用 `has store` ability？

**`store` ability 的作用：**
- 允许结构体被存储在全局存储中
- 允许结构体作为字段存储在另一个对象中
- **关键**：允许对象被转移（transfer）

**如果没有 `store` ability：**
- 对象创建后无法被转移给其他用户
- 无法使用 `transfer::public_transfer()` 或 `transfer::transfer()`
- 对象会"卡"在创建者那里

**为什么 Key 需要 `store`？**
- 在 `create_chatroom` 中，需要将 Key 对象转移给每个成员：
  ```move
  transfer::public_transfer(key_obj, member);
  ```
- 如果 Key 没有 `store` ability，这个转移操作会失败
- 用户需要能够转移 Key（虽然我们提供了 `transfer_to` 函数，但 `store` 是基础）

### 为什么 Key 是 owned object（而不是 shared object）？

**Owned Object 的特点：**
- 属于特定地址（owner）
- 只有 owner 可以转移或删除
- 查询效率高：可以通过 `sui_getOwnedObjects` 查询某个地址拥有的所有 Key
- 不需要版本控制（不像 shared object）

**如果 Key 是 shared object：**
- ❌ 无法确定谁"拥有"这个 Key（shared object 没有 owner）
- ❌ 无法通过 `sui_getOwnedObjects` 查询用户拥有的 Key
- ❌ 需要额外的机制来管理访问控制
- ❌ 增加不必要的复杂性（shared object 需要版本控制）

**为什么每个成员都有独立的 Key 对象？**
- 虽然所有 Key 对象包含相同的加密密钥（`key: vector<u8>`）
- 但每个成员拥有自己的 Key 对象实例
- 这样设计的好处：
  1. **访问控制**：通过检查用户是否拥有 Key 对象来判断权限
  2. **查询便利**：用户可以通过查询自己拥有的对象来找到相关的 chatroom
  3. **灵活性**：如果将来需要撤销某个成员的访问权限，可以设计一个机制来"销毁"或"转移"他们的 Key

### Abilities 组合对比

| Abilities | 类型 | 能否转移？ | 能否共享？ | 用途 |
|-----------|------|-----------|-----------|------|
| `has key` | Object | ❌ | ❌ | 需要是对象，但不可转移（很少用） |
| `has key, store` | Owned Object | ✅ | ❌ | **Key 的选择** - 可拥有、可转移 |
| `has key` (shared) | Shared Object | ❌ | ✅ | Chatroom 的选择 - 可共享、不可转移 |

**为什么 Key 不只用 `has key`？**
- 如果只有 `key` 而没有 `store`，对象无法被转移
- 在 `create_chatroom` 中无法将 Key 分发给成员
- 不符合我们的设计需求

**为什么 Key 不设计成 shared object？**
- Shared object 没有 owner，无法实现"拥有 Key = 有权限"的逻辑
- 查询效率低，无法通过 `sui_getOwnedObjects` 快速找到用户拥有的 Key
- 增加不必要的复杂性

### 实际使用场景

**1. 创建 chatroom 时分发 Key：**
```move
// 在 create_chatroom 中
let key_obj = key::create(chatroom_id, key, ctx);
transfer::public_transfer(key_obj, member); // 需要 store ability
```

**2. 发送消息时验证权限：**
```move
// 在 send_message 中
assert!(key::verify_chatroom(key, chatroom_id), EKeyMismatch);
// 用户必须拥有 Key 对象才能调用此函数
```

**3. 前端查询用户拥有的 chatroom：**
```typescript
// 前端代码
const ownedObjects = await suiClient.getOwnedObjects({
  owner: userAddress,
  filter: { StructType: `${PACKAGE_ID}::key::Key` }
});
// 通过拥有的 Key 对象，找到对应的 chatroom_id
```

**为什么 Key 是 owned object？**
- 每个成员拥有自己的 Key 对象
- 用于访问控制：只有拥有 Key 的用户才能发送消息
- 便于查询：用户可以通过查询自己拥有的对象来找到相关的 chatroom

### verify_chatroom 函数

```move
public fun verify_chatroom(key: &Key, chatroom_id: ID): bool {
    key.chatroom_id == chatroom_id
}
```

**解释：**
- 验证 Key 对象是否属于指定的 chatroom
- 用于 `send_message` 中的权限检查

---

## 设计决策总结

### 1. 为什么 Chatroom 是共享对象？
- 需要多个用户同时访问和更新
- 共享对象支持并发访问（通过版本控制）

### 2. 为什么 Chat 和 Key 是 owned objects？
- 每个用户拥有自己的 Chat 和 Key 对象
- 便于查询：用户可以通过查询自己拥有的对象来找到相关的 chatroom

### 3. 为什么使用 previous_chat_id 构建链表？
- 可以从最后一个消息向前遍历整个聊天历史
- 不需要在 Chatroom 中存储所有消息 ID（节省 gas）

### 4. 为什么需要 previous_chat_id 验证？
- 防止并发冲突：如果两个用户同时发送消息，只有一个会成功
- 确保消息的顺序性

### 5. 为什么使用 Clock 对象？
- Clock 是共享对象，由验证者维护，时间戳更准确
- 比 `tx_context::epoch_timestamp_ms` 更可靠

### 6. 为什么加密在链下进行？
- 链上加密/解密会消耗大量 gas
- 密钥存储在 Key 对象中，只有拥有 Key 的用户才能解密消息

---

## 常见问题

### Q: 如果两个用户同时发送消息会怎样？
A: 只有第一个成功提交的交易会成功，第二个会因为 `previous_chat_id` 不匹配而失败。用户需要重新读取最新的 `last_chat_id` 并重试。

### Q: 如何查询聊天历史？
A: 从 `chatroom.last_chat_id` 开始，通过 `chat.previous_chat_id` 向前遍历，直到 `previous_chat_id` 为 `none`。

### Q: 密钥安全吗？
A: 密钥存储在链上（Key 对象中），但只有拥有 Key 对象的用户才能访问。如果 Key 对象被转移，新拥有者也可以访问该 chatroom。

### Q: 可以删除消息吗？
A: 不可以。一旦消息被创建并上链，就无法删除（这是区块链的特性）。

### Q: 可以修改消息吗？
A: 不可以。Chat 对象是不可变的，一旦创建就无法修改。

---

## 更新日志

- 2024-XX-XX: 初始版本，使用 `clock::timestamp_ms` 获取时间戳

