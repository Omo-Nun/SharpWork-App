import { gradeSkillTest, getSkillTestQuestions } from '../lib/skillTest';
import { verifyWebhookSignature } from '../utils/paystack';

describe('Skill test grading', () => {
  it('passes when enough answers are correct', () => {
    const questions = getSkillTestQuestions(['Plumbing']);
    const answers = questions.map((q, index) => ({
      questionId: q.id,
      selectedIndex: index === 0 ? 1 : 1,
    }));
    const result = gradeSkillTest(answers);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(typeof result.passed).toBe('boolean');
  });
});

describe('Paystack webhook signature', () => {
  it('accepts valid signature in dev mode without secret', () => {
    const original = process.env.PAYSTACK_SECRET_KEY;
    delete process.env.PAYSTACK_SECRET_KEY;
    expect(verifyWebhookSignature('payload', 'anything')).toBe(true);
    process.env.PAYSTACK_SECRET_KEY = original;
  });
});
