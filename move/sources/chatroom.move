module sui_chat::chatroom;

use sui::object::{Self, ID, UID};
use sui::tx_context::{Self, TxContext};
use sui::transfer;
use std::option;

/// Chatroom Shared Object - stores metadata and last chat ID
public struct Chatroom has key {
    id: UID,
    creator: address,
    last_chat_id: option::Option<ID>,
    created_at: u64,
}

/// Create a new chatroom
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

/// Get the last chat ID
public fun last_chat_id(chatroom: &Chatroom): option::Option<ID> {
    chatroom.last_chat_id
}

/// Get the creator address
public fun creator(chatroom: &Chatroom): address {
    chatroom.creator
}

/// Get the creation timestamp
public fun created_at(chatroom: &Chatroom): u64 {
    chatroom.created_at
}

/// Update the last chat ID (internal use only)
public(package) fun update_last_chat_id(
    chatroom: &mut Chatroom,
    new_chat_id: ID,
) {
    chatroom.last_chat_id = option::some(new_chat_id);
}

/// Share the chatroom to make it accessible to everyone
public fun share(chatroom: Chatroom) {
    transfer::share_object(chatroom);
}

