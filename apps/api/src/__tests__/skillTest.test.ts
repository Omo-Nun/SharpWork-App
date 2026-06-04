import { gradeSkillTest, getSkillTestQuestions } from '../lib/skillTest';

describe('Skill test', () => {
  it('returns questions for selected skills', () => {
    const questions = getSkillTestQuestions(['Plumbing']);
    expect(questions.length).toBeGreaterThanOrEqual(2);
    expect(questions[0]).toHaveProperty('options');
    expect(questions[0]).not.toHaveProperty('correctIndex');
  });

  it('passes when score is at least 80%', () => {
    const questions = getSkillTestQuestions(['Plumbing', 'Electrical']);
    const answers = questions.map((q) => ({
      questionId: q.id,
      selectedIndex: q.id.includes('plumb') ? 1 : q.id.includes('elec') ? (q.id.endsWith('1') ? 1 : 2) : 1,
    }));
    const result = gradeSkillTest(answers);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.passed).toBe(true);
  });

  it('fails when all answers are wrong', () => {
    const questions = getSkillTestQuestions(['Plumbing']);
    const answers = questions.map((q) => ({ questionId: q.id, selectedIndex: 0 }));
    const result = gradeSkillTest(answers);
    expect(result.passed).toBe(false);
    expect(result.score).toBeLessThan(80);
  });

  it('fails with empty answers', () => {
    expect(gradeSkillTest([])).toEqual({ score: 0, passed: false });
  });
});
