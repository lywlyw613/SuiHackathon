module sui_chat::key;

use sui::object::{Self, ID, UID};
use sui::tx_context::TxContext;
use sui::transfer;

/// Key Object - owned by each member, contains encryption key for the chatroom
public struct Key has key, store {
    id: UID,
    chatroom_id: ID,
    key: vector<u8>, // 32 bytes for AES-256-GCM
}

/// Create a new key object
public fun create(
    chatroom_id: ID,
    key: vector<u8>,
    ctx: &mut TxContext,
): Key {
    Key {
        id: object::new(ctx),
        chatroom_id,
        key,
    }
}

/// Get the chatroom ID
public fun chatroom_id(key: &Key): ID {
    key.chatroom_id
}

/// Get the encryption key
public fun key(key: &Key): vector<u8> {
    key.key
}

/// Transfer key to an address
public fun transfer_to(key: Key, recipient: address) {
    transfer::transfer(key, recipient);
}

/// Verify that the key belongs to the specified chatroom
public fun verify_chatroom(key: &Key, chatroom_id: ID): bool {
    key.chatroom_id == chatroom_id
}

