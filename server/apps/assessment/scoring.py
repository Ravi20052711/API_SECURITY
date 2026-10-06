"""
Assessment Scoring and Knowledge Gain Engine.
Calculates attempt percentage, correctness, and Hake's Normalized Knowledge Gain.
"""

def calculate_attempt_score(answers_data):
    """
    Given a list of answer objects/dicts containing is_correct boolean,
    returns (total_questions, correct_count, score_percentage).
    """
    total = len(answers_data)
    if total == 0:
        return 0, 0, 0.0
    
    correct = sum(1 for a in answers_data if a.get('is_correct', False))
    percentage = round((correct / total) * 100.0, 1)
    return total, correct, percentage


def calculate_knowledge_gain(pre_score, post_score):
    """
    Calculates Absolute Gain and Hake's Normalized Gain:
      Absolute Gain = Post - Pre
      Normalized Gain g = (Post - Pre) / (100 - Pre)
    Handles boundary cases (e.g. Pre = 100).
    """
    if pre_score is None or post_score is None:
        return {
            'absolute_gain': None,
            'normalized_gain': None,
            'status': 'INCOMPLETE_DATA'
        }

    abs_gain = round(post_score - pre_score, 1)

    denominator = 100.0 - pre_score
    if denominator <= 0:
        # Pre-test score was 100%
        norm_gain = 1.0 if post_score >= 100.0 else round((post_score - pre_score) / 100.0, 3)
    else:
        norm_gain = round(abs_gain / denominator, 3)

    return {
        'pre_test_score': pre_score,
        'post_test_score': post_score,
        'absolute_gain': abs_gain,
        'normalized_gain': norm_gain,
        'status': 'CALCULATED'
    }
