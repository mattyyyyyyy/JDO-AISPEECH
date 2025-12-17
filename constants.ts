import { Voice } from './types';
import { Page } from './types';

// Generic pleasant audio for demo purposes (MP3 for compatibility)
const DEMO_AUDIO = "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";

export const MOCK_VOICES: Voice[] = [
  // --- PRESET (Official/System) Voices ---
  {
    id: 'v1',
    name: '不羁青年',
    gender: 'Male',
    language: 'Chinese',
    tags: ['潇洒', '青年'],
    category: 'Narrator',
    description: '一位潇洒不羁的青年男性声音，标准普通话。',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&clothing=hoodie',
    flag: '🇨🇳',
    isFavorite: true,
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v2',
    name: '嚣张小姐',
    gender: 'Female',
    language: 'Chinese',
    tags: ['自信', '优越感'],
    category: 'Character',
    description: '一位嚣张自信的青年女性声音，标准普通话，展现出优越感。',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella&top=shorthair',
    flag: '🇨🇳',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v3',
    name: '机械战甲',
    gender: 'Male',
    language: 'Chinese',
    tags: ['科幻', '机器人'],
    category: 'Character',
    description: '一位电子化、机器人般的青年男性声音，适合科幻或未来主义内容的标准普通话。',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mecha',
    flag: '🇨🇳',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v4',
    name: '热心大婶',
    gender: 'Female',
    language: 'Chinese',
    tags: ['温和', '善良'],
    category: 'Narrator',
    description: '一位温和善良的中年大婶声音，标准普通话，温暖而体贴。',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Auntie&top=hat',
    flag: '🇨🇳',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v5',
    name: '搞笑大爷',
    gender: 'Male',
    language: 'Chinese',
    tags: ['幽默', '爽朗', '北方口音'],
    category: 'Character',
    description: '一位爽朗幽默的老年男性大爷声音，带有北方口音的中文，充满个性。',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grandpa&facialHair=beard',
    flag: '🇨🇳',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v6',
    name: '温润男声',
    gender: 'Male',
    language: 'Chinese',
    tags: ['温润', '磁性'],
    category: 'Narrator',
    description: '一位温润磁性的青年男性声音，标准普通话。',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gentle&clothing=blazerAndShirt',
    flag: '🇨🇳',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },
  {
    id: 'v7',
    name: '温暖闺蜜',
    gender: 'Female',
    language: 'Chinese',
    tags: ['温暖', '清脆'],
    category: 'Social Media',
    description: '一位温暖清脆的青年女性闺蜜声音，标准普通话，友好而清晰。',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bestie',
    flag: '🇨🇳',
    previewUrl: DEMO_AUDIO,
    source: 'preset'
  },

  // --- DISCOVER (Community/Cloned) Voices (Renamed) ---
  {
    id: 'd1',
    name: '小王',
    gender: 'Female',
    language: 'Chinese',
    tags: ['专业', '播音腔'],
    category: 'News',
    description: '一位专业、播音腔的中年女性新闻主播，标准普通话。',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NewsAnchor',
    flag: '🇨🇳',
    previewUrl: DEMO_AUDIO,
    source: 'community'
  },
  {
    id: 'd2',
    name: '小李',
    gender: 'Male',
    language: 'Chinese',
    tags: ['沉稳', '可靠'],
    category: 'Character',
    description: '一位沉稳可靠的中年男性高管声音，标准普通话，传递出值得信赖的感觉。',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Executive',
    flag: '🇨🇳',
    previewUrl: DEMO_AUDIO,
    source: 'community'
  },
  {
    id: 'd3',
    name: '阿蔡',
    gender: 'Male',
    language: 'Chinese',
    tags: ['开朗', '清新'],
    category: 'Social Media',
    description: '一位开朗清新的青年男性声音，标准普通话，听起来阳光积极。',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SunnyBoy',
    flag: '🇨🇳',
    previewUrl: DEMO_AUDIO,
    source: 'community'
  },
  {
    id: 'd4',
    name: '傻冒',
    gender: 'Female',
    language: 'Chinese',
    tags: ['妩媚', '成熟'],
    category: 'Character',
    description: '一位妩媚成熟的青年御姐声音，标准普通话。',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SassyLady',
    flag: '🇨🇳',
    previewUrl: DEMO_AUDIO,
    source: 'community'
  },

  // --- CUSTOM (User) Voices ---
  {
    id: 'c1',
    name: '我的数字分身',
    gender: 'Male',
    language: 'Chinese',
    tags: ['个人专属'],
    category: 'Character',
    description: '您的专属定制声音模型。',
    isCustom: true,
    avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=clone1',
    flag: '🇨🇳',
    previewUrl: DEMO_AUDIO,
    source: 'custom'
  }
];

export const CATEGORY_MAP: Record<string, string> = {
  'Narrator': '角色配音',
  'News': '播客&新闻',
  'Social Media': '有声书',
  'Character': '角色配音'
};

export const translateCategory = (cat: string) => CATEGORY_MAP[cat] || cat;

export const NAV_GROUPS = [
  {
    title: '主菜单',
    id: 'main_menu',
    items: [
      { id: Page.HOME, label: '首页', icon: 'Home' },
    ]
  },
  {
    title: '声音库',
    id: 'library',
    items: [
      { id: Page.DISCOVER, label: '发现声音', icon: 'Globe' },
      { id: Page.PRESET, label: '预设声音', icon: 'Library' },
      { id: Page.CUSTOM, label: '自定义声音', icon: 'User' },
      { id: Page.FAVORITES, label: '我的收藏', icon: 'Heart' },
    ]
  },
  {
    title: '核心能力',
    id: 'capabilities',
    items: [
      { id: Page.ASR, label: '语音识别', icon: 'Mic' },
      { id: Page.TTS, label: '语音合成', icon: 'Speaker' },
      { id: Page.VOICE_CLONING, label: '声音克隆', icon: 'Copy' },
      { id: Page.DIARIZATION, label: '声纹识别', icon: 'Users' },
    ]
  }
];

export const RANDOM_READING_TEXTS = [
  "敏捷的棕色狐狸跳过了懒惰的狗。语音技术正在改变我们与世界互动的方式。",
  "在那遥远的山脉深处，古老的寺庙静静地伫立，守护着千年的秘密。",
  "科技的最美好之处在于它将人们联系在一起。我们要创造沟通的未来。"
];