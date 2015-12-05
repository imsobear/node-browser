module.exports = {
  '0': {
    code: '0',
    summary: 'Success',
    detail: 'The command executed successfully.'
  }, '6': {
    code: '6',
    summary: 'NoSuchDriver',
    detail: 'A session is either terminated or not started'
  }, '7': {
    code: '7',
    summary: 'NoSuchElement',
    detail: 'An element could not be located on the page using the given search parameters.'
  }, '8': {
    code: '8',
    summary: 'NoSuchFrame',
    detail: 'A request to switch to a frame could not be satisfied because the frame could not be found.'
  }, '9': {
    code: '9',
    summary: 'UnknownCommand',
    detail: 'The requested resource could not be found, or a request was received using an HTTP method that is not supported by the mapped resource.'
  }, '10': {
    code: '10',
    summary: 'StaleElementReference',
    detail: 'An element command failed because the referenced element is no longer attached to the DOM.'
  }, '11': {
    code: '11',
    summary: 'ElementNotVisible',
    detail: 'An element command could not be completed because the element is not visible on the page.'
  }, '12': {
    code: '12',
    summary: 'InvalidElementState',
    detail: 'An element command could not be completed because the element is in an invalid state (e.g. attempting to click a disabled element).'
  }, '13': {
    code: '13',
    summary: 'UnknownError',
    detail: 'An unknown server-side error occurred while processing the command.'
  }, '15': {
    code: '15',
    summary: 'ElementIsNotSelectable',
    detail: 'An attempt was made to select an element that cannot be selected.'
  }, '17': {
    code: '17',
    summary: 'JavaScriptError',
    detail: 'An error occurred while executing user supplied JavaScript.'
  }, '19': {
    code: '19',
    summary: 'XPathLookupError',
    detail: 'An error occurred while searching for an element by XPath.'
  }, '21': {
    code: '21',
    summary: 'Timeout',
    detail: 'An operation did not complete before its timeout expired.'
  }, '23': {
    code: '23',
    summary: 'NoSuchWindow',
    detail: 'A request to switch to a different window could not be satisfied because the window could not be found.'
  }, '24': {
    code: '24',
    summary: 'InvalidCookieDomain',
    detail: 'An illegal attempt was made to set a cookie under a different domain than the current page.'
  }, '25': {
    code: '25',
    summary: 'UnableToSetCookie',
    detail: 'A request to set a cookie\'s value could not be satisfied.'
  }, '26': {
    code: '26',
    summary: 'UnexpectedAlertOpen',
    detail: 'A modal dialog was open, blocking this operation'
  }, '27': {
    code: '27',
    summary: 'NoAlertOpenError',
    detail: 'An attempt was made to operate on a modal dialog when one was not open.'
  }, '28': {
    code: '28',
    summary: 'ScriptTimeout',
    detail: 'A script did not complete before its timeout expired.'
  }, '29': {
    code: '29',
    summary: 'InvalidElementCoordinates',
    detail: 'The coordinates provided to an interactions operation are invalid.'
  }, '30': {
    code: '30',
    summary: 'IMENotAvailable',
    detail: 'IME was not available.'
  }, '31': {
    code: '31',
    summary: 'IMEEngineActivationFailed',
    detail: 'An IME engine could not be started.'
  }, '32': {
    code: '32',
    summary: 'InvalidSelector',
    detail: 'Argument was an invalid selector (e.g. XPath/CSS).'
  }, '33': {
    code: '33',
    summary: 'SessionNotCreatedException',
    detail: 'A new session could not be created.'
  }, '34': {
    code: '34',
    summary: 'MoveTargetOutOfBounds',
    detail: 'Target provided for a move action is out of bounds.'
  }
};