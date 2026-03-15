/**
 * NotificationPreferences entity — per-user notification settings (COMP-028.5).
 * Architecture: COMP-028, communication domain
 */

import type { DeliveryChannel } from "./delivery-channel.js";

const VALID_CHANNELS: readonly DeliveryChannel[] = ["in_app", "email", "push"];

function isValidChannel(c: string): c is DeliveryChannel {
  return VALID_CHANNELS.includes(c as DeliveryChannel);
}

function validateChannelPreferences(
  channelPreferences: Record<string, DeliveryChannel[]>
): void {
  for (const [key, channels] of Object.entries(channelPreferences)) {
    if (typeof key !== "string" || key.trim() === "") {
      throw new Error("channelPreferences keys must be non-empty strings");
    }
    if (!Array.isArray(channels)) {
      throw new Error(
        `channelPreferences["${key}"] must be an array of DeliveryChannel`
      );
    }
    for (const ch of channels) {
      if (!isValidChannel(ch)) {
        throw new Error(
          `Invalid channel "${ch}"; must be one of: in_app, email, push`
        );
      }
    }
  }
}

export interface NotificationPreferencesParams {
  userId: string;
  muteUntil: Date | null;
  channelPreferences: Record<string, DeliveryChannel[]>;
}

/**
 * Per-user notification preferences: snooze (mute_until) and per-type channel toggles.
 * One entity per user; missing notification type in channelPreferences means all channels enabled.
 */
export class NotificationPreferences {
  readonly userId: string;
  readonly muteUntil: Date | null;
  readonly channelPreferences: Readonly<Record<string, DeliveryChannel[]>>;

  constructor(params: NotificationPreferencesParams) {
    if (!params.userId?.trim()) {
      throw new Error("NotificationPreferences userId cannot be empty");
    }
    if (
      params.muteUntil != null &&
      (!(params.muteUntil instanceof Date) ||
        Number.isNaN(params.muteUntil.getTime()))
    ) {
      throw new Error("NotificationPreferences muteUntil must be null or a valid Date");
    }
    validateChannelPreferences(params.channelPreferences ?? {});

    this.userId = params.userId.trim();
    this.muteUntil = params.muteUntil;
    this.channelPreferences = Object.freeze(
      Object.fromEntries(
        Object.entries(params.channelPreferences ?? {}).map(([k, v]) => [
          k,
          [...v],
        ])
      )
    );
  }
}
