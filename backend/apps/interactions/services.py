from __future__ import annotations

from django.utils import timezone

from apps.interactions.models import Block, Connection, Like
from apps.chat.services import broadcast_connection_closed


def ordered_users(user_a, user_b):
    return (user_a, user_b) if user_a.id < user_b.id else (user_b, user_a)


def ensure_like(sender, recipient):
    like, created = Like.objects.get_or_create(sender=sender, recipient=recipient, defaults={"is_active": True})
    if not created and not like.is_active:
        like.is_active = True
        like.save(update_fields=["is_active", "updated_at"])
    return like


def deactivate_like(sender, recipient):
    like = Like.objects.filter(sender=sender, recipient=recipient).first()
    if like and like.is_active:
        like.is_active = False
        like.save(update_fields=["is_active", "updated_at"])
    return like


def ensure_connection(user_a, user_b):
    user_low, user_high = ordered_users(user_a, user_b)
    connection, created = Connection.objects.get_or_create(user_low=user_low, user_high=user_high, defaults={"is_active": True})
    if not created and not connection.is_active:
        connection.is_active = True
        connection.closed_at = None
        connection.save(update_fields=["is_active", "closed_at"])
    return connection, created


def close_connection(user_a, user_b):
    user_low, user_high = ordered_users(user_a, user_b)
    connection = Connection.objects.filter(user_low=user_low, user_high=user_high, is_active=True).first()
    if connection:
        connection.is_active = False
        connection.closed_at = timezone.now()
        connection.save(update_fields=["is_active", "closed_at"])
        broadcast_connection_closed(connection.id, reason="inactive")
    return connection


def ensure_block(blocker, blocked):
    block, created = Block.objects.get_or_create(blocker=blocker, blocked=blocked, defaults={"is_active": True})
    if not created and not block.is_active:
        block.is_active = True
        block.save(update_fields=["is_active"])
    return block


def deactivate_block(blocker, blocked):
    block = Block.objects.filter(blocker=blocker, blocked=blocked).first()
    if block and block.is_active:
        block.is_active = False
        block.save(update_fields=["is_active"])
    return block


def disconnect_users(user_a, user_b):
    deactivate_like(user_a, user_b)
    deactivate_like(user_b, user_a)
    return close_connection(user_a, user_b)
