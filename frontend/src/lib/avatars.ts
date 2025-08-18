// Central avatar providers and helpers

export type AvatarProvider =
  | 'dicebear-initials'
  | 'dicebear-fun'
  | 'dicebear-avataaars'
  | 'dicebear-adventurer'
  | 'dicebear-bottts'
  | 'dicebear-pixel'
  | 'ui-avatars'
  | 'github'
  | 'gravatar'
  | 'cartoon-avatar'
  | 'robohash';

export function avatarFromProvider(provider: AvatarProvider, seed: string): string {
  const safe = encodeURIComponent(seed || 'Zemon User');
  switch (provider) {
    case 'dicebear-initials':
      return `https://api.dicebear.com/7.x/initials/svg?seed=${safe}`;
    case 'dicebear-fun':
      return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${safe}`;
    case 'dicebear-avataaars':
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${safe}`;
    case 'dicebear-adventurer':
      return `https://api.dicebear.com/7.x/adventurer/svg?seed=${safe}`;
    case 'dicebear-bottts':
      return `https://api.dicebear.com/7.x/bottts/svg?seed=${safe}`;
    case 'dicebear-pixel':
      return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${safe}`;
    case 'ui-avatars':
      return `https://ui-avatars.com/api/?name=${safe}&background=random&size=160&rounded=true`;
    case 'github':
      return `https://avatars.githubusercontent.com/${seed}`;
    case 'gravatar':
      // seed should be md5(email) if used; as a placeholder, use plain seed
      return `https://www.gravatar.com/avatar/${safe}?d=identicon`;
    case 'cartoon-avatar': {
      // Seed is in the form male-12 or female-33
      const [gender, idx] = (seed || 'male-1').split('-');
      const folder = gender === 'female' ? 'female' : 'male';
      const num = Math.max(1, Math.min(Number(idx) || 1, 100));
      return `https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/${folder}/${num}.png`;
    }
    case 'robohash': {
      // Default robots with size
      const base = `https://robohash.org/${safe}.png`;
      return `${base}?size=200x200`;
    }
    default:
      return `https://api.dicebear.com/7.x/initials/svg?seed=${safe}`;
  }
}

export function buildDefaultAvatarList(name: string, username?: string): string[] {
  const seed = username || name || 'Zemon User';
  return [
    avatarFromProvider('dicebear-initials', seed),
    avatarFromProvider('dicebear-fun', seed),
    avatarFromProvider('ui-avatars', name || seed),
    avatarFromProvider('gravatar', seed),
  ];
}

// Superhero-style seeds (DC + Marvel names as seeds for stylized avatars)
const SUPERHERO_SEEDS = [
  'Batman','Superman','Wonder Woman','Flash','Aquaman','Cyborg',
  'Green Lantern','Shazam','Nightwing','Batgirl',
  'Iron Man','Captain America','Thor','Hulk','Black Widow','Hawkeye',
  'Spider-Man','Doctor Strange','Black Panther','Captain Marvel',
];

function buildDicebearSet(provider: AvatarProvider, seeds: string[]): string[] {
  return seeds.map(seed => avatarFromProvider(provider, seed));
}

function buildCartoonAvatarSet(limit: number = 24): string[] {
  const urls: string[] = [];
  const max = Math.max(6, Math.min(limit, 60));
  for (let i = 1; i <= max; i++) {
    const gender = i % 2 === 0 ? 'male' : 'female';
    urls.push(avatarFromProvider('cartoon-avatar', `${gender}-${i}`));
  }
  return urls;
}

// Robohash helper (sets: set1 robots, set2 monsters, set3 heads, set4 cats, set5 avataaars, set6 gorillas)
function buildRobohash(seed: string, opts?: { set?: 'set1'|'set2'|'set3'|'set4'|'set5'|'set6'; bgset?: 'bg1'|'bg2'|'any'; size?: string }) {
  const safeSeed = encodeURIComponent(seed || 'Zemon User');
  const params = new URLSearchParams();
  params.set('size', opts?.size || '200x200');
  if (opts?.set) params.set('set', opts.set);
  if (opts?.bgset) params.set('bgset', opts.bgset);
  return `https://robohash.org/${safeSeed}.png?${params.toString()}`;
}

export type AvatarCategoryKey =
  | 'recommended'
  | 'cartoons'
  | 'adventurer'
  | 'avataaars'
  | 'pixel'
  | 'bottts'
  | 'superheroes'
  | 'robohash-robots'
  | 'robohash-monsters'
  | 'robohash-heads'
  | 'robohash-cats'
  | 'robohash-avatars'
  | 'robohash-gorillas';

export interface AvatarCategory {
  key: AvatarCategoryKey;
  label: string;
  urls: string[];
}

export function buildAvatarCategories(name: string, username?: string): AvatarCategory[] {
  const seed = username || name || 'Zemon User';
  const recommended = [
    avatarFromProvider('dicebear-initials', seed),
    avatarFromProvider('ui-avatars', name || seed),
    avatarFromProvider('dicebear-fun', seed),
    avatarFromProvider('gravatar', seed),
  ];
  return [
    { key: 'recommended', label: 'Recommended', urls: recommended },
    { key: 'cartoons', label: 'Cartoons', urls: buildCartoonAvatarSet(24) },
    { key: 'adventurer', label: 'Adventurer', urls: buildDicebearSet('dicebear-adventurer', [seed, ...SUPERHERO_SEEDS]) },
    { key: 'avataaars', label: 'Avataaars', urls: buildDicebearSet('dicebear-avataaars', [seed, ...SUPERHERO_SEEDS]) },
    { key: 'pixel', label: 'Pixel', urls: buildDicebearSet('dicebear-pixel', [seed, 'Pixel Hero', 'Retro', ...SUPERHERO_SEEDS.slice(0, 6)]) },
    { key: 'bottts', label: 'Bots', urls: buildDicebearSet('dicebear-bottts', [seed, 'Coder', 'Hacker', 'Robot', ...SUPERHERO_SEEDS.slice(6, 12)]) },
    { key: 'superheroes', label: 'Superheroes', urls: [
      ...buildDicebearSet('dicebear-adventurer', SUPERHERO_SEEDS),
      ...buildDicebearSet('dicebear-avataaars', SUPERHERO_SEEDS)
    ] },
    { key: 'robohash-robots', label: 'Robohash Robots', urls: [seed, ...SUPERHERO_SEEDS].slice(0, 16).map(s => buildRobohash(s, { set: 'set1', bgset: 'bg1' })) },
    { key: 'robohash-monsters', label: 'Robohash Monsters', urls: [seed, ...SUPERHERO_SEEDS].slice(0, 16).map(s => buildRobohash(s, { set: 'set2' })) },
    { key: 'robohash-heads', label: 'Robohash Heads', urls: [seed, ...SUPERHERO_SEEDS].slice(0, 16).map(s => buildRobohash(s, { set: 'set3' })) },
    { key: 'robohash-cats', label: 'Robohash Cats', urls: [seed, ...SUPERHERO_SEEDS].slice(0, 16).map(s => buildRobohash(s, { set: 'set4' })) },
    { key: 'robohash-avatars', label: 'Robohash Avataaars', urls: [seed, ...SUPERHERO_SEEDS].slice(0, 16).map(s => buildRobohash(s, { set: 'set5' })) },
    { key: 'robohash-gorillas', label: 'Robohash Gorillas', urls: [seed, ...SUPERHERO_SEEDS].slice(0, 16).map(s => buildRobohash(s, { set: 'set6' })) },
  ];
}


