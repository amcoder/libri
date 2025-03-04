import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/style-guide')({
  component: StyleGuide,
})

export function StyleGuide() {
  return (
    <>
      <h1>Header 1</h1>
      <h2>Header 2</h2>
      <h3>Header 3</h3>
      <h4>Header 4</h4>
      <h5>Header 5</h5>
      <h6>Header 6</h6>

      <p>Paragraph</p>
      <blockquote>Blockquote</blockquote>
      <pre>Preformatted</pre>

      <ul>
        <li>List item</li>
        <li>List item</li>
        <li>List item</li>
      </ul>

      <ol>
        <li>List item</li>
        <li>List item</li>
        <li>List item</li>
      </ol>

      <form>
        <fieldset>
          <legend>Text</legend>
          <label>
            Text: <input type='text' name='text' />
          </label>
          <label>
            Email: <input type='email' name='email' />
          </label>
          <label>
            Password: <input type='password' name='password' />
          </label>
          <label>
            Textarea: <textarea name='textarea' value='Textarea' />
          </label>
        </fieldset>
        <fieldset>
          <legend>Numbers</legend>
          <label>
            Number:{' '}
            <input type='number' min='0' step='0.1' defaultValue='1.0' />
          </label>
        </fieldset>
        <fieldset>
          <legend>Date and Time</legend>
          <label>
            Date: <input type='date' name='date' />
          </label>
          <label>
            Datetime: <input type='datetime-local' name='datetime' />
          </label>
          <label>
            Month: <input type='month' name='month' />
          </label>
          <label>
            Week: <input type='week' name='week' />
          </label>
          <label>
            Time: <input type='time' name='time' />
          </label>
        </fieldset>

        <fieldset>
          <legend>Select</legend>
          <label>
            Select:{' '}
            <select name='select'>
              <option value='1'>Option 1</option>
              <option value='2'>Option 2</option>
              <option value='3'>Option 3</option>
              <optgroup label='Group'>
                <option value='4'>Option 4</option>
                <option value='5'>Option 5</option>
                <option value='6'>Option 6</option>
              </optgroup>
            </select>
          </label>
        </fieldset>

        <fieldset>
          <legend>Range</legend>
          <label>
            Range:{' '}
            <input type='range' name='range' min='0' max='100' step='1' />
          </label>
        </fieldset>

        <fieldset>
          <legend>Color</legend>
          <label>
            Color: <input type='color' name='color' defaultValue='#000000' />
          </label>
        </fieldset>

        <fieldset>
          <legend>Progress</legend>
          <label>
            Progress:{' '}
            <progress value='50' max='100'>
              50%
            </progress>
          </label>
        </fieldset>

        <fieldset>
          <legend>Radio</legend>
          <label>
            <input type='radio' name='radio' value='1' />
            Radio 1
          </label>
          <label>
            <input type='radio' name='radio' value='2' />
            Radio 2
          </label>
        </fieldset>

        <fieldset>
          <legend>Checkbox</legend>
          <label>
            <input type='checkbox' name='checkbox' value='1' />
            Checkbox 1
          </label>
          <label>
            <input type='checkbox' name='checkbox' value='2' />
            Checkbox 2
          </label>
        </fieldset>

        <button type='submit'>Submit</button>
        <input type='submit' value='Submit' />
        <input type='reset' value='Reset' />
        <input type='button' value='Button' />
      </form>
    </>
  )
}
