// Central avatar providers and helpers

export type AvatarProvider =
  | 'dicebear-initials'
  | 'dicebear-fun'
  | 'dicebear-avataaars'
  | 'dicebear-adventurer'
  | 'dicebear-bottts'
  | 'dicebear-pixel'
  | 'dicebear-personas'
  | 'dicebear-lorelei'
  | 'dicebear-micah'
  | 'dicebear-miniavs'
  | 'dicebear-notionists'
  | 'dicebear-open-peeps'
  | 'dicebear-rings'
  | 'dicebear-shapes'
  | 'dicebear-sunset'
  | 'dicebear-identicon'
  | 'dicebear-ui-avatars'
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
    case 'dicebear-personas':
      return `https://api.dicebear.com/7.x/personas/svg?seed=${safe}`;
    case 'dicebear-lorelei':
      return `https://api.dicebear.com/7.x/lorelei/svg?seed=${safe}`;
    case 'dicebear-micah':
      return `https://api.dicebear.com/7.x/micah/svg?seed=${safe}`;
    case 'dicebear-miniavs':
      return `https://api.dicebear.com/7.x/miniavs/svg?seed=${safe}`;
    case 'dicebear-notionists':
      return `https://api.dicebear.com/7.x/notionists/svg?seed=${safe}`;
    case 'dicebear-open-peeps':
      return `https://api.dicebear.com/7.x/open-peeps/svg?seed=${safe}`;
    case 'dicebear-rings':
      return `https://api.dicebear.com/7.x/rings/svg?seed=${safe}`;
    case 'dicebear-shapes':
      return `https://api.dicebear.com/7.x/shapes/svg?seed=${safe}`;
    case 'dicebear-sunset':
      return `https://api.dicebear.com/7.x/sunset/svg?seed=${safe}`;
    case 'dicebear-identicon':
      return `https://api.dicebear.com/7.x/identicon/svg?seed=${safe}`;
    case 'dicebear-ui-avatars':
      return `https://api.dicebear.com/7.x/ui-avatars/svg?seed=${safe}`;
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
    avatarFromProvider('dicebear-avataaars', name || seed),
    avatarFromProvider('dicebear-adventurer', seed),
  ];
}

// Superhero-style seeds (DC + Marvel names as seeds for stylized avatars)
const SUPERHERO_SEEDS = [
  'Batman','Superman','Wonder Woman','Flash','Aquaman','Cyborg',
  'Green Lantern','Shazam','Nightwing','Batgirl',
  'Iron Man','Captain America','Thor','Hulk','Black Widow','Hawkeye',
  'Spider-Man','Doctor Strange','Black Panther','Captain Marvel',
];

// Additional creative seeds for variety
const CREATIVE_SEEDS = [
  'Artist', 'Creator', 'Innovator', 'Dreamer', 'Explorer', 'Builder',
  'Thinker', 'Visionary', 'Pioneer', 'Trailblazer', 'Inventor', 'Designer',
  'Developer', 'Engineer', 'Scientist', 'Researcher', 'Scholar', 'Student',
  'Teacher', 'Mentor', 'Leader', 'Collaborator', 'Problem Solver', 'Creative'
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
  | 'dicebear-classic'
  | 'dicebear-modern'
  | 'dicebear-artistic'
  | 'dicebear-geometric'
  | 'cartoons'
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
  description?: string;
}

export function buildAvatarCategories(name: string, username?: string): AvatarCategory[] {
  const seed = username || name || 'Zemon User';
  const allSeeds = [seed, ...SUPERHERO_SEEDS, ...CREATIVE_SEEDS];
  
  const recommended = [
    avatarFromProvider('dicebear-initials', seed),
    avatarFromProvider('dicebear-avataaars', seed),
    avatarFromProvider('dicebear-adventurer', seed),
    avatarFromProvider('dicebear-fun', seed),
  ];

  return [
    { 
      key: 'recommended', 
      label: '✨ Recommended', 
      urls: recommended,
      description: 'Best avatars for your profile'
    },
    { 
      key: 'dicebear-classic', 
      label: '🎭 Classic Styles', 
      urls: [
        ...buildDicebearSet('dicebear-avataaars', allSeeds.slice(0, 20)),
        ...buildDicebearSet('dicebear-adventurer', allSeeds.slice(0, 20)),
        ...buildDicebearSet('dicebear-bottts', allSeeds.slice(0, 20))
      ],
      description: 'Timeless avatar styles'
    },
    { 
      key: 'dicebear-modern', 
      label: '🚀 Modern Styles', 
      urls: [
        ...buildDicebearSet('dicebear-personas', allSeeds.slice(0, 20)),
        ...buildDicebearSet('dicebear-lorelei', allSeeds.slice(0, 20)),
        ...buildDicebearSet('dicebear-micah', allSeeds.slice(0, 20))
      ],
      description: 'Contemporary avatar designs'
    },
    { 
      key: 'dicebear-artistic', 
      label: '🎨 Artistic Styles', 
      urls: [
        ...buildDicebearSet('dicebear-miniavs', allSeeds.slice(0, 20)),
        ...buildDicebearSet('dicebear-notionists', allSeeds.slice(0, 20)),
        ...buildDicebearSet('dicebear-open-peeps', allSeeds.slice(0, 20))
      ],
      description: 'Creative and expressive avatars'
    },
    { 
      key: 'dicebear-geometric', 
      label: '🔷 Geometric Styles', 
      urls: [
        ...buildDicebearSet('dicebear-pixel', allSeeds.slice(0, 20)),
        ...buildDicebearSet('dicebear-rings', allSeeds.slice(0, 20)),
        ...buildDicebearSet('dicebear-shapes', allSeeds.slice(0, 20)),
        ...buildDicebearSet('dicebear-sunset', allSeeds.slice(0, 20))
      ],
      description: 'Abstract and geometric patterns'
    },
    { 
      key: 'cartoons', 
      label: '🎪 Cartoon Characters', 
      urls: buildCartoonAvatarSet(24),
      description: 'Fun cartoon-style avatars'
    },
    { 
      key: 'superheroes', 
      label: '🦸 Superheroes', 
      urls: [
        ...buildDicebearSet('dicebear-adventurer', SUPERHERO_SEEDS),
        ...buildDicebearSet('dicebear-avataaars', SUPERHERO_SEEDS),
        ...buildDicebearSet('dicebear-personas', SUPERHERO_SEEDS)
      ],
      description: 'Heroic and powerful avatars'
    },
    { 
      key: 'robohash-robots', 
      label: '🤖 Robotic', 
      urls: allSeeds.slice(0, 20).map(s => buildRobohash(s, { set: 'set1', bgset: 'bg1' })),
      description: 'Futuristic robot avatars'
    },
    { 
      key: 'robohash-monsters', 
      label: '👹 Monstrous', 
      urls: allSeeds.slice(0, 20).map(s => buildRobohash(s, { set: 'set2' })),
      description: 'Unique monster designs'
    },
    { 
      key: 'robohash-heads', 
      label: '👤 Abstract Heads', 
      urls: allSeeds.slice(0, 20).map(s => buildRobohash(s, { set: 'set3' })),
      description: 'Abstract head patterns'
    },
    { 
      key: 'robohash-cats', 
      label: '🐱 Feline', 
      urls: allSeeds.slice(0, 20).map(s => buildRobohash(s, { set: 'set4' })),
      description: 'Cat-inspired avatars'
    },
    { 
      key: 'robohash-avatars', 
      label: '🎭 Robohash Avataaars', 
      urls: allSeeds.slice(0, 20).map(s => buildRobohash(s, { set: 'set5' })),
      description: 'Robohash avataaars style'
    },
    { 
      key: 'robohash-gorillas', 
      label: '🦍 Gorilla', 
      urls: allSeeds.slice(0, 20).map(s => buildRobohash(s, { set: 'set6' })),
      description: 'Gorilla-themed avatars'
    },
  ];
}

// Helper function to get a random avatar from any provider
export function getRandomAvatar(name: string, username?: string): string {
  const providers: AvatarProvider[] = [
    'dicebear-initials', 'dicebear-avataaars', 'dicebear-adventurer',
    'dicebear-personas', 'dicebear-lorelei', 'dicebear-micah',
    'dicebear-miniavs', 'dicebear-notionists', 'dicebear-open-peeps'
  ];
  const randomProvider = providers[Math.floor(Math.random() * providers.length)];
  return avatarFromProvider(randomProvider, username || name || 'Zemon User');
}

// Helper function to get avatars with custom parameters
export function getCustomDicebearAvatar(style: string, seed: string, options?: Record<string, string>): string {
  const safeSeed = encodeURIComponent(seed || 'Zemon User');
  const params = new URLSearchParams();
  
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      params.set(key, value);
    });
  }
  
  const queryString = params.toString();
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${safeSeed}${queryString ? `&${queryString}` : ''}`;
}


