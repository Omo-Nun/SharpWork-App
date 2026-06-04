export interface SkillQuestion {
  id: string;
  skill: string;
  question: string;
  options: string[];
}

export interface SkillAnswer {
  questionId: string;
  selectedIndex: number;
}

const QUESTION_BANK: Array<SkillQuestion & { correctIndex: number }> = [
  {
    id: 'plumb-1',
    skill: 'Plumbing',
    question: 'What is the first step when fixing a leaking pipe under a sink?',
    options: ['Replace the pipe immediately', 'Shut off the water supply', 'Apply tape and test', 'Call the customer'],
    correctIndex: 1,
  },
  {
    id: 'plumb-2',
    skill: 'Plumbing',
    question: 'Which tool is best for tightening threaded pipe fittings?',
    options: ['Hammer', 'Pipe wrench', 'Screwdriver', 'Level'],
    correctIndex: 1,
  },
  {
    id: 'elec-1',
    skill: 'Electrical',
    question: 'Before working on a circuit, you must:',
    options: ['Wear gloves only', 'Turn off the breaker and verify power is off', 'Use any available wire', 'Work quickly'],
    correctIndex: 1,
  },
  {
    id: 'elec-2',
    skill: 'Electrical',
    question: 'Green/yellow wire insulation typically indicates:',
    options: ['Live wire', 'Neutral wire', 'Earth/ground wire', 'Data wire'],
    correctIndex: 2,
  },
  {
    id: 'gen-1',
    skill: 'General',
    question: 'When arriving at a customer home, you should:',
    options: ['Start work immediately', 'Confirm scope, price, and safety', 'Ask for full payment upfront in cash', 'Bring extra helpers without notice'],
    correctIndex: 1,
  },
  {
    id: 'gen-2',
    skill: 'General',
    question: 'SharpWork escrow is released when:',
    options: ['Artisan accepts the job', 'Payment is initiated', 'Customer confirms job completion', 'Admin logs in'],
    correctIndex: 2,
  },
];

const PASS_THRESHOLD = 80;

export function getSkillTestQuestions(skills: string[]): SkillQuestion[] {
  const normalized = skills.map((s) => s.toLowerCase());
  const selected = QUESTION_BANK.filter(
    (q) => q.skill === 'General' || normalized.some((s) => q.skill.toLowerCase().includes(s) || s.includes(q.skill.toLowerCase()))
  );

  const unique = new Map<string, (typeof QUESTION_BANK)[number]>();
  for (const q of selected) {
    if (!unique.has(q.id)) unique.set(q.id, q);
  }

  const questions = Array.from(unique.values()).slice(0, 4);
  if (questions.length < 2) {
    return QUESTION_BANK.filter((q) => q.skill === 'General').slice(0, 2).map(stripAnswer);
  }

  return questions.map(stripAnswer);
}

function stripAnswer(q: (typeof QUESTION_BANK)[number]): SkillQuestion {
  return { id: q.id, skill: q.skill, question: q.question, options: q.options };
}

export function gradeSkillTest(answers: SkillAnswer[]): { score: number; passed: boolean } {
  if (!Array.isArray(answers) || answers.length === 0) {
    return { score: 0, passed: false };
  }

  let correct = 0;
  for (const answer of answers) {
    const question = QUESTION_BANK.find((q) => q.id === answer.questionId);
    if (question && question.correctIndex === answer.selectedIndex) {
      correct += 1;
    }
  }

  const score = Math.round((correct / answers.length) * 100);
  return { score, passed: score >= PASS_THRESHOLD };
}
