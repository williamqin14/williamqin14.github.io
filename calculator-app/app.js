function toNumber(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error('Both inputs must be valid numbers.');
  }
  return parsed;
}

function calculate({ a, b, operator }) {
  const left = toNumber(a);
  const right = toNumber(b);

  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      if (right === 0) {
        throw new Error('Cannot divide by zero.');
      }
      return left / right;
    default:
      throw new Error('Operator must be one of +, -, *, /.');
  }
}

module.exports = {
  calculate
};
