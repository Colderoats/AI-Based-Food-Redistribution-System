import unittest

from risk_scoring.predict import recommend_reorder


class ReorderRecommendationTests(unittest.TestCase):
    def test_capacity_safe_reorder_cases(self):
        cases = [
            (10, 50, 100, 2, 20, 0),
            (80, 20, 200, 2, 160, 140),
            (80, 20, 100, 2, 100, 80),
            (0, 20, 100, 2, 0, 0),
            (100, 100, 100, 2, 100, 0),
        ]
        for demand, stock, capacity, safety_days, target, quantity in cases:
            with self.subTest(demand=demand, stock=stock, capacity=capacity):
                result = recommend_reorder(demand, stock, capacity, safety_days)
                self.assertEqual(result["target_stock"], target)
                self.assertEqual(result["recommended_purchase_quantity"], quantity)
                self.assertLessEqual(result["target_stock"], capacity)
                self.assertLessEqual(result["recommended_purchase_quantity"], capacity - stock)
