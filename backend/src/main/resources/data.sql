UPDATE expense_splits s 
SET amount = (
    SELECT e.amount / (SELECT COUNT(*) FROM expense_splits s2 WHERE s2.expense_id = e.id) 
    FROM expenses e 
    WHERE e.id = s.expense_id AND e.split_type = 'EQUAL'
) 
WHERE amount = 0;
