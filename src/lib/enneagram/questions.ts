// ============================================================
// Enneagram Deep Dive — 36-Question Forced-Choice Assessment
// Based on Riso-Hudson framework (The Wisdom of the Enneagram)
// ============================================================

export interface EnneagramQuestion {
  id: number
  optionA: string
  optionB: string
  types: [number, number] // which types each option favors
}

// 36 forced-choice pairs — each covers a different type comparison
export const ENNEAGRAM_QUESTIONS: EnneagramQuestion[] = [
  {
    id: 1,
    optionA: 'I am driven by a need to do things correctly and improve what is imperfect.',
    optionB: 'I am driven by a need to be loved and needed by the people around me.',
    types: [1, 2],
  },
  {
    id: 2,
    optionA: 'I tend to focus more on achieving results and appearing successful to others.',
    optionB: 'I tend to focus more on expressing my unique identity and authentic feelings.',
    types: [3, 4],
  },
  {
    id: 3,
    optionA: 'I prefer to gather knowledge and observe before acting.',
    optionB: 'I rely on trusted systems, authorities, and loyal relationships for security.',
    types: [5, 6],
  },
  {
    id: 4,
    optionA: 'I seek excitement, new experiences, and avoid boredom or pain.',
    optionB: 'I prefer to protect my autonomy and avoid being controlled or harmed.',
    types: [7, 8],
  },
  {
    id: 5,
    optionA: 'I value harmony and prefer to avoid conflict and strong opinions.',
    optionB: 'I hold myself to high standards and feel guilty when I fall short.',
    types: [9, 1],
  },
  {
    id: 6,
    optionA: 'I find fulfillment in genuinely helping others meet their needs.',
    optionB: 'I feel most alive when I am accomplishing goals and moving forward.',
    types: [2, 3],
  },
  {
    id: 7,
    optionA: 'I sometimes feel that something important is missing or that I am fundamentally different.',
    optionB: 'I tend to withdraw to think things through before engaging with the world.',
    types: [4, 5],
  },
  {
    id: 8,
    optionA: 'I often anticipate what could go wrong and prepare for worst-case scenarios.',
    optionB: 'I keep my options open and reframe limitations as opportunities.',
    types: [6, 7],
  },
  {
    id: 9,
    optionA: 'I am comfortable asserting myself and taking charge when I see what needs to be done.',
    optionB: 'I often go along with others\' wishes to maintain peace and connection.',
    types: [8, 9],
  },
  {
    id: 10,
    optionA: 'Criticism of my work feels like criticism of my entire self.',
    optionB: 'I often prioritize others\' feelings and needs over my own.',
    types: [1, 2],
  },
  {
    id: 11,
    optionA: 'I sometimes adjust my persona to fit the situation and be seen as competent.',
    optionB: 'I experience deep feelings of longing, melancholy, and aesthetic sensitivity.',
    types: [3, 4],
  },
  {
    id: 12,
    optionA: 'I need significant alone time to process and recharge my energy.',
    optionB: 'I feel most secure when I have clear expectations and reliable people around me.',
    types: [5, 6],
  },
  {
    id: 13,
    optionA: 'I prefer to keep plans flexible so I can pivot toward the best opportunity.',
    optionB: 'I am naturally protective and take action when I or others are threatened.',
    types: [7, 8],
  },
  {
    id: 14,
    optionA: 'I find it hard to take a clear stance — seeing all sides makes deciding difficult.',
    optionB: 'I have a strong inner critic that notices errors before others do.',
    types: [9, 1],
  },
  {
    id: 15,
    optionA: 'I intuitively sense what others need and feel satisfied when I can provide it.',
    optionB: 'My self-worth is closely tied to my accomplishments and how others see me.',
    types: [2, 3],
  },
  {
    id: 16,
    optionA: "I often feel envious of others who seem to have what I'm missing.",
    optionB: 'I am protective of my time, energy, and privacy.',
    types: [4, 5],
  },
  {
    id: 17,
    optionA: 'I am cautious about trust and tend to look for hidden motives.',
    optionB: 'I tend to avoid negative emotions and stay focused on positive possibilities.',
    types: [6, 7],
  },
  {
    id: 18,
    optionA: 'I prefer direct confrontation over diplomacy when something needs to be addressed.',
    optionB: 'I tend to minimize my own preferences to avoid rocking the boat.',
    types: [8, 9],
  },
  {
    id: 19,
    optionA: "I notice wrongdoing and feel compelled to speak up, even when it's uncomfortable.",
    optionB: 'I give freely of my time, energy, and affection — sometimes to my own detriment.',
    types: [1, 2],
  },
  {
    id: 20,
    optionA: "I can easily shift my image and focus depending on who I'm with and what they value.",
    optionB: 'I am drawn to what is rare, meaningful, and aesthetically significant.',
    types: [3, 4],
  },
  {
    id: 21,
    optionA: 'I prefer to understand systems and concepts thoroughly before committing to action.',
    optionB: 'I find safety in structure, authority, and groups I can trust.',
    types: [5, 6],
  },
  {
    id: 22,
    optionA: 'I believe life should be an adventure — why suffer when you can find joy?',
    optionB: 'Weakness or vulnerability in myself makes me deeply uncomfortable.',
    types: [7, 8],
  },
  {
    id: 23,
    optionA: "I'm skilled at seeing every perspective, which sometimes leaves me without a clear position.",
    optionB: 'I hold myself and others to high ethical standards.',
    types: [9, 1],
  },
  {
    id: 24,
    optionA: "People often say I'm the most caring and supportive person they know.",
    optionB: 'I measure myself by what I achieve and how others perceive my success.',
    types: [2, 3],
  },
  {
    id: 25,
    optionA: 'I am often moved by beauty and feel emotions with unusual depth and intensity.',
    optionB: 'I need time alone to think, research, and process before I feel ready.',
    types: [4, 5],
  },
  {
    id: 26,
    optionA: 'I often doubt myself and seek reassurance before acting on major decisions.',
    optionB: 'I get bored easily and constantly look for the next interesting thing to pursue.',
    types: [6, 7],
  },
  {
    id: 27,
    optionA: "I respect people who are direct and strong, and I don't respond well to weakness.",
    optionB: 'I am a natural mediator — I can find the middle ground almost anyone can accept.',
    types: [8, 9],
  },
  {
    id: 28,
    optionA: 'I have a hard time relaxing when things are disorganized or done incorrectly.',
    optionB: "I feel most myself when I'm in a close, emotionally connected relationship.",
    types: [1, 2],
  },
  {
    id: 29,
    optionA: 'I adapt my personality to fit different contexts — I can be whoever the situation needs.',
    optionB: 'I feel a deep yearning for something — a sense of incompleteness or romantic longing.',
    types: [3, 4],
  },
  {
    id: 30,
    optionA: "I prefer to be an observer rather than a participant, at least until I've analyzed the situation.",
    optionB: 'I feel more secure with clear plans, loyal allies, and contingency thinking.',
    types: [5, 6],
  },
  {
    id: 31,
    optionA: 'Life is too short for suffering — I prefer to focus on the positive and keep moving.',
    optionB: 'I am naturally assertive, protective, and comfortable with conflict.',
    types: [7, 8],
  },
  {
    id: 32,
    optionA: "I often merge with others' agendas without realizing I've lost track of my own.",
    optionB: "I'm sensitive to criticism and feel a deep responsibility to do things right.",
    types: [9, 1],
  },
  {
    id: 33,
    optionA: "I give and give — it's hard for me to receive care gracefully.",
    optionB: 'I feel pressured to succeed and sometimes struggle to know who I am apart from achievements.',
    types: [2, 3],
  },
  {
    id: 34,
    optionA: 'I spend a lot of time in my inner emotional world, processing feelings through art or reflection.',
    optionB: 'I am intellectually curious and tend to detach emotions when analyzing a problem.',
    types: [4, 5],
  },
  {
    id: 35,
    optionA: 'I tend to scan for danger or betrayal and need to test the trustworthiness of people over time.',
    optionB: 'I am optimistic by nature and tend to minimize the seriousness of problems.',
    types: [6, 7],
  },
  {
    id: 36,
    optionA: 'I trust my gut and take decisive action, sometimes at the expense of careful reflection.',
    optionB: 'I often go with the flow, finding it difficult to prioritize my own desires.',
    types: [8, 9],
  },
]

export interface EnneagramScores {
  type1: number
  type2: number
  type3: number
  type4: number
  type5: number
  type6: number
  type7: number
  type8: number
  type9: number
}

export function scoreEnneagram(answers: Record<number, 'A' | 'B'>): EnneagramScores {
  const scores: EnneagramScores = { type1: 0, type2: 0, type3: 0, type4: 0, type5: 0, type6: 0, type7: 0, type8: 0, type9: 0 }

  for (const [questionIdStr, answer] of Object.entries(answers)) {
    const questionId = parseInt(questionIdStr)
    const question = ENNEAGRAM_QUESTIONS.find((q) => q.id === questionId)
    if (!question) continue

    const chosenType = answer === 'A' ? question.types[0] : question.types[1]
    const key = `type${chosenType}` as keyof EnneagramScores
    scores[key]++
  }

  return scores
}

export function detectType(scores: EnneagramScores): { coreType: number; wing: string; likelyTritype: string } {
  const entries = Object.entries(scores).map(([k, v]) => ({
    type: parseInt(k.replace('type', '')),
    score: v,
  })).sort((a, b) => b.score - a.score)

  const coreType = entries[0].type

  // Wing is the adjacent type with the higher score
  const wings = [(coreType === 1 ? 9 : coreType - 1), (coreType === 9 ? 1 : coreType + 1)]
  const wing = wings.reduce((best, w) => {
    const wKey = `type${w}` as keyof EnneagramScores
    const bKey = `type${best}` as keyof EnneagramScores
    return scores[wKey] > scores[bKey] ? w : best
  }, wings[0])

  // Tri-type: highest from each center (gut: 8,9,1 / heart: 2,3,4 / head: 5,6,7)
  const gutTypes = [8, 9, 1]
  const heartTypes = [2, 3, 4]
  const headTypes = [5, 6, 7]
  const topGut = gutTypes.reduce((a, b) => scores[`type${a}` as keyof EnneagramScores] >= scores[`type${b}` as keyof EnneagramScores] ? a : b)
  const topHeart = heartTypes.reduce((a, b) => scores[`type${a}` as keyof EnneagramScores] >= scores[`type${b}` as keyof EnneagramScores] ? a : b)
  const topHead = headTypes.reduce((a, b) => scores[`type${a}` as keyof EnneagramScores] >= scores[`type${b}` as keyof EnneagramScores] ? a : b)

  // Order: core type center first, then the other two by score
  const triCenters = [topGut, topHeart, topHead]
  const coreCenter = gutTypes.includes(coreType) ? topGut : heartTypes.includes(coreType) ? topHeart : topHead
  const otherTwo = triCenters.filter((t) => t !== coreCenter).sort((a, b) => scores[`type${b}` as keyof EnneagramScores] - scores[`type${a}` as keyof EnneagramScores])
  const likelyTritype = `${coreCenter}-${otherTwo[0]}-${otherTwo[1]}`

  return { coreType, wing: `${coreType}w${wing}`, likelyTritype }
}
