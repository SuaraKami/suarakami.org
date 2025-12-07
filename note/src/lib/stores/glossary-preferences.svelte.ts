import { PersistedState } from "runed";

export const glossaryPreference = new PersistedState<boolean>(
  "suarakami:glossary-enabled",
  false
);
