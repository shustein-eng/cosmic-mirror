// ============================================================
// Middos Assessment — 40 Scenario-Based Questions
// Covers 13 middos categories from classical mussar
// ============================================================

export interface MiddosQuestion {
  id: number
  middah: string
  hebrewMiddah: string
  question: string
  type: 'multiple_choice' | 'scale'
  options?: string[]
  scaleLabels?: [string, string]
}

export const MIDDOS_QUESTIONS: MiddosQuestion[] = [
  // Savlanut (Patience)
  {
    id: 1,
    middah: 'Patience',
    hebrewMiddah: 'סבלנות',
    question: 'You are stuck in traffic and will be 20 minutes late to an important meeting. Your most immediate inner response is:',
    type: 'multiple_choice',
    options: [
      'A deep breath — I redirect my focus to what I can control',
      'Frustration, but I quickly talk myself down',
      'I feel the frustration strongly and it lingers',
      'I spiral into imagining worst-case outcomes',
    ],
  },
  {
    id: 2,
    middah: 'Patience',
    hebrewMiddah: 'סבלנות',
    question: 'When learning a new skill that takes much longer than expected, I typically:',
    type: 'scale',
    scaleLabels: ['Give up or feel deeply discouraged', 'Persist with ease and curiosity'],
  },
  {
    id: 3,
    middah: 'Patience',
    hebrewMiddah: 'סבלנות',
    question: 'A close friend is venting to you about a problem they have mentioned many times before. You:',
    type: 'multiple_choice',
    options: [
      'Listen fully, as if hearing it for the first time',
      'Listen, though I feel mild internal resistance',
      'Gently try to redirect toward solutions',
      'Find it genuinely difficult to stay fully present',
    ],
  },

  // Hakarat HaTov (Gratitude)
  {
    id: 4,
    middah: 'Gratitude',
    hebrewMiddah: 'הכרת הטוב',
    question: 'At the end of a difficult week, your dominant internal narrative tends to be:',
    type: 'multiple_choice',
    options: [
      'Gratitude for what went right despite the difficulty',
      'Relief that it\'s over, with some appreciation',
      'Focus on what went wrong and what needs to improve',
      'Exhaustion — I rarely pause to reflect on the week',
    ],
  },
  {
    id: 5,
    middah: 'Gratitude',
    hebrewMiddah: 'הכרת הטוב',
    question: 'When someone does something kind for me — even something small — I feel:',
    type: 'scale',
    scaleLabels: ['Barely notice or take it for granted', 'Genuinely moved and deeply appreciative'],
  },

  // Anavah (Humility)
  {
    id: 6,
    middah: 'Humility',
    hebrewMiddah: 'ענוה',
    question: 'You worked hard on a project that received excellent feedback. When someone asks who deserves credit, you:',
    type: 'multiple_choice',
    options: [
      'Genuinely feel the success was collaborative and say so',
      'Accept credit while noting others\' contributions',
      'Accept credit — you did work hard for it',
      'Deflect credit even when it is deserved',
    ],
  },
  {
    id: 7,
    middah: 'Humility',
    hebrewMiddah: 'ענוה',
    question: 'When I discover I was wrong about something I stated confidently, I typically:',
    type: 'scale',
    scaleLabels: ['Feel embarrassed and defensive', 'Acknowledge it easily and update my view'],
  },
  {
    id: 8,
    middah: 'Humility',
    hebrewMiddah: 'ענוה',
    question: 'You meet someone significantly more accomplished than you in your field. Your honest inner reaction is:',
    type: 'multiple_choice',
    options: [
      'Genuine curiosity and desire to learn from them',
      'Admiration mixed with some personal inadequacy',
      'Healthy competitive motivation',
      'Discomfort or a need to establish your own credentials',
    ],
  },

  // Chesed (Kindness)
  {
    id: 9,
    middah: 'Kindness',
    hebrewMiddah: 'חסד',
    question: 'You notice a stranger struggling with heavy bags. Without anyone watching, you:',
    type: 'multiple_choice',
    options: [
      'Immediately offer to help without overthinking',
      'Consider helping, then offer',
      'Think about it but talk myself out of getting involved',
      'Feel bad but walk on — I don\'t like initiating with strangers',
    ],
  },
  {
    id: 10,
    middah: 'Kindness',
    hebrewMiddah: 'חסד',
    question: 'When a friend needs emotional support, I find it:',
    type: 'scale',
    scaleLabels: ['Draining — I struggle to give emotionally', 'Deeply fulfilling — it energizes me'],
  },

  // Tzedek (Justice / Fairness)
  {
    id: 11,
    middah: 'Justice',
    hebrewMiddah: 'צדק',
    question: 'You witness someone breaking a small but clear rule (e.g., cutting a line). Your most honest reaction is:',
    type: 'multiple_choice',
    options: [
      'Strong internal disturbance — fairness matters deeply to me',
      'Mild annoyance, then I let it go',
      'I notice it but don\'t let it affect me much',
      'I barely register it unless it affects me directly',
    ],
  },
  {
    id: 12,
    middah: 'Justice',
    hebrewMiddah: 'צדק',
    question: 'When making a decision that affects others, the factor I weight most heavily is:',
    type: 'multiple_choice',
    options: [
      'What is objectively fair to all parties',
      'What preserves the relationships involved',
      'What produces the best outcome overall',
      'What I was asked to do or what the rules say',
    ],
  },

  // Emet (Truth / Honesty)
  {
    id: 13,
    middah: 'Truth',
    hebrewMiddah: 'אמת',
    question: 'A friend shows you creative work and asks for your opinion. It has significant flaws. You:',
    type: 'multiple_choice',
    options: [
      'Give honest, specific, constructive feedback',
      'Soften the truth significantly to protect their feelings',
      'Focus only on positives',
      'Ask clarifying questions to understand their goals first, then share',
    ],
  },
  {
    id: 14,
    middah: 'Truth',
    hebrewMiddah: 'אמת',
    question: 'When I catch myself bending the truth to avoid conflict or discomfort, I feel:',
    type: 'scale',
    scaleLabels: ['Barely notice — it feels natural', 'Strongly uncomfortable — it goes against my nature'],
  },

  // Zerizut (Diligence / Promptness)
  {
    id: 15,
    middah: 'Diligence',
    hebrewMiddah: 'זריזות',
    question: 'You have a large project with a deadline three weeks away. You naturally:',
    type: 'multiple_choice',
    options: [
      'Break it into milestones and begin immediately',
      'Start within the first few days after some planning',
      'Begin steadily in the middle week',
      'Work most intensively in the final days before the deadline',
    ],
  },
  {
    id: 16,
    middah: 'Diligence',
    hebrewMiddah: 'זריזות',
    question: 'When I commit to something, I follow through:',
    type: 'scale',
    scaleLabels: ['Inconsistently — circumstances pull me away', 'Reliably — my word is my word'],
  },

  // Nedivut (Generosity)
  {
    id: 17,
    middah: 'Generosity',
    hebrewMiddah: 'נדיבות',
    question: 'When I give — whether money, time, or resources — it typically feels:',
    type: 'multiple_choice',
    options: [
      'Joyful and natural — I give freely',
      'Good, though I sometimes hesitate internally',
      'I give appropriately but think carefully about it',
      'I struggle with generosity — something holds me back',
    ],
  },
  {
    id: 18,
    middah: 'Generosity',
    hebrewMiddah: 'נדיבות',
    question: 'Someone in my community has a genuine need I could help with. Before knowing if others will contribute, I:',
    type: 'multiple_choice',
    options: [
      'Give immediately based on the need, not others\' behavior',
      'Wait to see if others respond first, then match',
      'Give a small amount to feel I\'ve done my part',
      'Feel the pull to help but often find reasons to hold back',
    ],
  },

  // Bitachon (Trust / Faith)
  {
    id: 19,
    middah: 'Trust',
    hebrewMiddah: 'בטחון',
    question: 'Facing a situation genuinely outside my control, my dominant inner experience is:',
    type: 'multiple_choice',
    options: [
      'A deep sense of calm — I trust things will unfold as needed',
      'Concern, but I\'m able to settle into acceptance',
      'Significant anxiety that I have to actively manage',
      'I avoid thinking about it — uncertainty is very uncomfortable for me',
    ],
  },
  {
    id: 20,
    middah: 'Trust',
    hebrewMiddah: 'בטחון',
    question: 'When things don\'t go as planned, I tend to:',
    type: 'scale',
    scaleLabels: ['Catastrophize and assume the worst', 'Remain open — setbacks often lead somewhere better'],
  },

  // Simcha (Joy)
  {
    id: 21,
    middah: 'Joy',
    hebrewMiddah: 'שמחה',
    question: 'My baseline emotional state in ordinary daily life could best be described as:',
    type: 'multiple_choice',
    options: [
      'Generally positive and light',
      'Neutral with good moments',
      'Weighted — joy takes conscious effort',
      'I tend toward heaviness or melancholy',
    ],
  },
  {
    id: 22,
    middah: 'Joy',
    hebrewMiddah: 'שמחה',
    question: 'When celebrating a friend\'s good news, I feel:',
    type: 'scale',
    scaleLabels: ['Envy or flatness — their success doesn\'t move me', 'Genuine shared joy — their happiness becomes mine'],
  },
  {
    id: 23,
    middah: 'Joy',
    hebrewMiddah: 'שמחה',
    question: 'How easily do you find delight in small, ordinary pleasures?',
    type: 'multiple_choice',
    options: [
      'Very easily — I find beauty and joy in everyday moments',
      'Fairly easily when I\'m present',
      'I\'m too focused or preoccupied to notice much',
      'I require significant experiences to feel true delight',
    ],
  },

  // Seder (Order)
  {
    id: 24,
    middah: 'Order',
    hebrewMiddah: 'סדר',
    question: 'My physical and digital workspace tends to be:',
    type: 'multiple_choice',
    options: [
      'Well-organized — I have systems for everything',
      'Generally tidy with occasional chaos',
      'Organized in my own way that others might not understand',
      'Often disorganized — I function better than you\'d expect from the chaos',
    ],
  },
  {
    id: 25,
    middah: 'Order',
    hebrewMiddah: 'סדר',
    question: 'Unexpected changes to my schedule or plans make me feel:',
    type: 'scale',
    scaleLabels: ['Deeply disrupted — I need structure to function', 'Easily adaptable — I flow with changes'],
  },

  // Rachamim (Compassion)
  {
    id: 26,
    middah: 'Compassion',
    hebrewMiddah: 'רחמים',
    question: 'When I witness someone in genuine pain or suffering — even a stranger — I:',
    type: 'multiple_choice',
    options: [
      'Feel it deeply myself — I\'m highly empathic',
      'Feel moved and want to help',
      'Feel concern but maintain emotional distance',
      'Feel uncomfortable and tend to detach',
    ],
  },
  {
    id: 27,
    middah: 'Compassion',
    hebrewMiddah: 'רחמים',
    question: 'When someone who has hurt me is going through a hard time, I:',
    type: 'multiple_choice',
    options: [
      'Feel genuine compassion — their pain and my grievance are separate',
      'Feel compassion but have to work through the resentment',
      'Struggle — the grievance makes it hard to feel compassion',
      'Find it very difficult — I don\'t easily separate pain from past hurt',
    ],
  },

  // Ometz Lev (Courage)
  {
    id: 28,
    middah: 'Courage',
    hebrewMiddah: 'אומץ לב',
    question: 'When I have an unpopular opinion in a group discussion, I typically:',
    type: 'multiple_choice',
    options: [
      'State it clearly — I say what I think regardless of reaction',
      'Share it, though with some internal hesitation',
      'Soften or qualify it heavily before sharing',
      'Stay quiet — social harmony matters more to me than being heard',
    ],
  },
  {
    id: 29,
    middah: 'Courage',
    hebrewMiddah: 'אומץ לב',
    question: 'When I need to have a difficult conversation — giving honest feedback or addressing a conflict — I:',
    type: 'scale',
    scaleLabels: ['Avoid it as long as possible', 'Address it directly and promptly'],
  },
  {
    id: 30,
    middah: 'Courage',
    hebrewMiddah: 'אומץ לב',
    question: 'Facing a challenging new opportunity that involves significant risk, I feel:',
    type: 'multiple_choice',
    options: [
      'Excited — risk energizes me',
      'Interested but cautious — I assess carefully',
      'Anxious — I prefer security over opportunity',
      'Paralyzed — the fear of failure is very loud',
    ],
  },

  // Cross-cutting behavioral patterns
  {
    id: 31,
    middah: 'Patience',
    hebrewMiddah: 'סבלנות',
    question: 'A project I care deeply about is progressing much more slowly than planned due to factors outside my control. My response over time is:',
    type: 'multiple_choice',
    options: [
      'I stay present to each step with equanimity',
      'I feel impatience but channel it productively',
      'I grow increasingly frustrated',
      'I start to lose hope and consider abandoning it',
    ],
  },
  {
    id: 32,
    middah: 'Justice',
    hebrewMiddah: 'צדק',
    question: 'When I make a mistake that affects others, I feel:',
    type: 'multiple_choice',
    options: [
      'Accountable — I own it, make amends, and move forward',
      'Guilty — I take responsibility but dwell on it',
      'Defensive — I look for mitigating factors first',
      'Deeply ashamed — mistakes feel like reflections of my worth',
    ],
  },
  {
    id: 33,
    middah: 'Generosity',
    hebrewMiddah: 'נדיבות',
    question: 'When I have much and another has little, I experience:',
    type: 'scale',
    scaleLabels: ['Little internal pull to share', 'Strong pull to share — having abundance feels incomplete without giving'],
  },
  {
    id: 34,
    middah: 'Humility',
    hebrewMiddah: 'ענוה',
    question: 'How important is being recognized and acknowledged for your work?',
    type: 'scale',
    scaleLabels: ['Very important — recognition motivates me', 'The work itself matters — recognition is secondary'],
  },
  {
    id: 35,
    middah: 'Kindness',
    hebrewMiddah: 'חסד',
    question: 'You can tell a colleague is having a very bad day, though they haven\'t said anything. You:',
    type: 'multiple_choice',
    options: [
      'Find a warm, natural way to check in',
      'Want to check in but feel awkward initiating',
      'Leave them alone — I respect people\'s space',
      'Don\'t usually notice unless someone tells me directly',
    ],
  },
  {
    id: 36,
    middah: 'Order',
    hebrewMiddah: 'סדר',
    question: 'When working on a complex problem, I naturally:',
    type: 'multiple_choice',
    options: [
      'Organize my approach systematically before starting',
      'Plan a little, then iterate as I go',
      'Dive in and figure it out along the way',
      'Get overwhelmed by complexity and procrastinate',
    ],
  },
  {
    id: 37,
    middah: 'Truth',
    hebrewMiddah: 'אמת',
    question: 'When I hold a belief that the people around me contradict strongly, I:',
    type: 'multiple_choice',
    options: [
      'Hold my ground if the evidence supports my view',
      'Remain open but don\'t abandon my view easily',
      'Find myself updating just to reduce the social discomfort',
      'Often capitulate — disagreement is very uncomfortable',
    ],
  },
  {
    id: 38,
    middah: 'Gratitude',
    hebrewMiddah: 'הכרת הטוב',
    question: 'Do you actively acknowledge people who have helped you or invested in you?',
    type: 'scale',
    scaleLabels: ['Rarely — I assume they know', 'Regularly and genuinely — I express gratitude often'],
  },
  {
    id: 39,
    middah: 'Compassion',
    hebrewMiddah: 'רחמים',
    question: 'Someone in your community is struggling due to choices they made themselves. How much compassion do you feel?',
    type: 'multiple_choice',
    options: [
      'Full compassion — suffering is suffering regardless of cause',
      'Compassion, though I find myself judging the choices',
      'Less compassion — I believe in personal responsibility',
      'Minimal compassion — they brought this on themselves',
    ],
  },
  {
    id: 40,
    middah: 'Joy',
    hebrewMiddah: 'שמחה',
    question: 'When you look at your life overall, your dominant feeling is:',
    type: 'multiple_choice',
    options: [
      'Deep gratitude and fullness',
      'Appreciation with significant longing for more',
      'More focused on what\'s missing than what\'s present',
      'A persistent restlessness that is hard to settle',
    ],
  },
]

export const MIDDOS_CATEGORIES = [
  { name: 'Patience', hebrew: 'סבלנות', questionIds: [1, 2, 3, 31] },
  { name: 'Gratitude', hebrew: 'הכרת הטוב', questionIds: [4, 5, 38] },
  { name: 'Humility', hebrew: 'ענוה', questionIds: [6, 7, 8, 34] },
  { name: 'Kindness', hebrew: 'חסד', questionIds: [9, 10, 35] },
  { name: 'Justice', hebrew: 'צדק', questionIds: [11, 12, 32] },
  { name: 'Truth', hebrew: 'אמת', questionIds: [13, 14, 37] },
  { name: 'Diligence', hebrew: 'זריזות', questionIds: [15, 16] },
  { name: 'Generosity', hebrew: 'נדיבות', questionIds: [17, 18, 33] },
  { name: 'Trust', hebrew: 'בטחון', questionIds: [19, 20] },
  { name: 'Joy', hebrew: 'שמחה', questionIds: [21, 22, 23, 40] },
  { name: 'Order', hebrew: 'סדר', questionIds: [24, 25, 36] },
  { name: 'Compassion', hebrew: 'רחמים', questionIds: [26, 27, 39] },
  { name: 'Courage', hebrew: 'אומץ לב', questionIds: [28, 29, 30] },
]
