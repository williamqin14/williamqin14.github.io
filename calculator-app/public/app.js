const form = document.getElementById('calculator-form');
const resultElement = document.getElementById('result');

form.addEventListener('submit', async event => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = {
    a: formData.get('a'),
    b: formData.get('b'),
    operator: formData.get('operator')
  };

  resultElement.textContent = 'Calculating...';

  try {
    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong.');
    }

    resultElement.textContent = `Result: ${data.result}`;
  } catch (error) {
    resultElement.textContent = `Error: ${error.message}`;
  }
});
