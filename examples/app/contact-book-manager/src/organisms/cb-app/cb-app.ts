// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { WebUIElement, observable } from "@microsoft/webui-framework";
import { Router } from "@microsoft/webui-router";
import { api } from "#api";

// Child components used in cb-app.html
import "#organisms/cb-header/cb-header.js";
import "#organisms/cb-sidebar/cb-sidebar.js";

type SearchChangeEvent = CustomEvent<{ value: string }>;
type ContactEvent = CustomEvent<{ id: string }>;
type FormSaveEvent = CustomEvent<Record<string, string>>;

export class CbApp extends WebUIElement {
  @observable page = "";
  @observable searchQuery = "";
  @observable activeGroup = "all";
  @observable totalContacts = "0";
  @observable totalFavorites = "0";
  @observable groups: string[] = [];

  private searchTimer: number | undefined;

  onSearch(e: SearchChangeEvent): void {
    const value = e.detail.value ?? "";
    this.searchQuery = value;

    if (this.searchTimer !== undefined) {
      window.clearTimeout(this.searchTimer);
    }

    this.searchTimer = window.setTimeout(() => {
      this.navigateForSearch(this.searchQuery.trim());
    }, 500);
  }

  private navigateForSearch(query: string): void {
    const suffix = query ? `?q=${encodeURIComponent(query)}` : "";

    if (this.page === "favorites") {
      Router.navigate(`/favorites${suffix}`);
      return;
    }

    if (
      this.page === "group" &&
      this.activeGroup &&
      this.activeGroup !== "all"
    ) {
      Router.navigate(
        `/groups/${encodeURIComponent(this.activeGroup)}${suffix}`,
      );
      return;
    }

    Router.navigate(`/contacts${suffix}`);
  }

  onSelectContact(e: ContactEvent): void {
    Router.navigate(`/contacts/${e.detail.id}`);
  }

  onEditContact(e: ContactEvent): void {
    Router.navigate(`/contacts/${e.detail.id}/edit`);
  }

  async onDeleteContactEvent(e: ContactEvent): Promise<void> {
    const id = e.detail.id;
    try {
      await api.contacts.delete(id);
      Router.navigate("/contacts");
    } catch {
      console.error(`Failed to delete contact with id ${id}`);
    }
  }

  async onToggleFavoriteEvent(e: ContactEvent): Promise<void> {
    const id = e.detail.id;
    try {
      const updated = await api.contacts.toggleFavorite(id);
      const count = Number.parseInt(this.totalFavorites, 10) || 0;
      this.totalFavorites = String(count + (updated.favorite ? 1 : -1));
    } catch {
      console.error(`Failed to toggle favorite for contact with id ${id}`);
    }
  }

  onBack(): void {
    Router.back();
  }

  async onFormSaveEvent(e: FormSaveEvent): Promise<void> {
    const data = e.detail;
    try {
      let saved;
      if (data.id) {
        saved = await api.contacts.update(data.id, data);
      } else {
        saved = await api.contacts.create(data);
      }
      Router.navigate(`/contacts/${saved.id}`);
    } catch {
      console.error("Failed to save contact", data);
    }
  }

  onFormCancel(): void {
    Router.back();
  }
}

CbApp.define("cb-app");
