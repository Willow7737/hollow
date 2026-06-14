// Known Hollow Knight save fields with descriptions and categories
// Used for the Quick Edit panel and field tooltips

export const FIELD_CATEGORIES = [
  {
    id: 'player',
    label: 'Player Stats',
    icon: '🛡️',
    fields: [
      { path: 'maxHealth', label: 'Max Health (Masks)', type: 'number', min: 1, max: 99, description: 'Maximum number of health masks' },
      { path: 'MPReserveMax', label: 'Max Soul', type: 'number', min: 0, max: 999, description: 'Maximum soul reserve (99 = one vessel)' },
      { path: 'geo', label: 'Geo', type: 'number', min: 0, max: 999999, description: 'Current geo currency' },
      { path: 'scenarioState', label: 'Scenario State', type: 'string', description: 'Current game scenario/area' },
    ],
  },
  {
    id: 'charms',
    label: 'Charms',
    icon: '💎',
    fields: [
      { path: 'charmCost', label: 'Charm Costs', type: 'array', description: 'Array of notch costs for each charm' },
      { path: 'charmSlots', label: 'Charm Slots (Notches)', type: 'number', min: 0, max: 11, description: 'Number of available charm notches' },
      { path: 'gotCharm', label: 'Charms Owned', type: 'array', description: 'Boolean array of which charms are owned' },
      { path: 'equippedCharms', label: 'Equipped Charms', type: 'array', description: 'Array of currently equipped charm IDs' },
    ],
  },
  {
    id: 'progression',
    label: 'Progression',
    icon: '🗺️',
    fields: [
      { path: 'mapZone', label: 'Map Zone', type: 'number', description: 'Current map zone index' },
      { path: 'scenesVisited', label: 'Scenes Visited', type: 'array', description: 'List of visited scene names' },
      { path: 'kills', label: 'Kill Counts', type: 'object', description: 'Object mapping enemy types to kill counts' },
      { path: 'birthscreen', label: 'Game Completed', type: 'number', description: 'Set to 1 if the game has been completed' },
    ],
  },
  {
    id: 'abilities',
    label: 'Abilities & Skills',
    icon: '⚔️',
    fields: [
      { path: 'hasDash', label: 'Mothwing Cloak (Dash)', type: 'number', min: 0, max: 1, description: '1 = has dash ability' },
      { path: 'hasDoubleJump', label: 'Monarch Wings (Double Jump)', type: 'number', min: 0, max: 1, description: '1 = has double jump' },
      { path: 'hasWallJump', label: 'Mantis Claw (Wall Jump)', type: 'number', min: 0, max: 1, description: '1 = has wall jump' },
      { path: 'hasSuperDash', label: 'Crystal Heart (Super Dash)', type: 'number', min: 0, max: 1, description: '1 = has super dash' },
      { path: 'hasShadowDash', label: 'Shade Cloak (Shadow Dash)', type: 'number', min: 0, max: 1, description: '1 = has shadow dash' },
      { path: 'hasUpwardDash', label: 'Upward Dash', type: 'number', min: 0, max: 1, description: '1 = has upward dash' },
      { path: 'hasDashSlash', label: 'Great Slash', type: 'number', min: 0, max: 1, description: '1 = has dash slash (nail art)' },
      { path: 'hasCyclone', label: 'Cyclone Slash', type: 'number', min: 0, max: 1, description: '1 = has cyclone slash (nail art)' },
      { path: 'hasDownSlash', label: 'Descending Dark', type: 'number', min: 0, max: 1, description: '1 = has descending dark' },
      { path: 'hasSpell', label: 'Vengeful Spirit', type: 'number', min: 0, max: 1, description: '1 = has vengeful spirit spell' },
      { path: 'hasFireball', label: 'Shade Soul', type: 'number', min: 0, max: 1, description: '1 = has shade soul spell' },
      { path: 'hasScream', label: 'Howling Wraiths', type: 'number', min: 0, max: 1, description: '1 = has howling wraiths spell' },
      { path: 'hasUpSpell', label: 'Abyss Shriek', type: 'number', min: 0, max: 1, description: '1 = has abyss shriek spell' },
      { path: 'hasHealSpell', label: 'Focus (Heal)', type: 'number', min: 0, max: 1, description: '1 = can heal' },
    ],
  },
  {
    id: 'nail',
    label: 'Nail Upgrades',
    icon: '🔨',
    fields: [
      { path: 'nailSmithUpgrades', label: 'Nail Upgrades', type: 'number', min: 0, max: 4, description: '0=Old, 1=Sharpened, 2=Channeled, 3=Coiled, 4=Pure Nail' },
    ],
  },
  {
    id: 'misc',
    label: 'Miscellaneous',
    icon: '📦',
    fields: [
      { path: 'grimmChildLevel', label: 'Grimmchild Level', type: 'number', min: 0, max: 4, description: 'Current Grimmchild charm level' },
      { path: 'carefreeMelody', label: 'Carefree Melody', type: 'number', min: 0, max: 1, description: '1 = has Carefree Melody charm' },
      { path: 'dreamOrbs', label: 'Dream Orbs', type: 'number', min: 0, max: 9999, description: 'Collected dream orb count' },
      { path: 'dreamNailUpgraded', label: 'Dream Nail Upgraded', type: 'number', min: 0, max: 1, description: '1 = Dream Nail has been upgraded' },
    ],
  },
]

// Flatten all fields into a single lookup map: path -> field info
export const FIELD_MAP = {}
for (const category of FIELD_CATEGORIES) {
  for (const field of category.fields) {
    FIELD_MAP[field.path] = { ...field, category: category.id, categoryLabel: category.label }
  }
}
